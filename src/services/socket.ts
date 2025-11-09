import { io, Socket } from 'socket.io-client';
import type { ClientToServerEnvelope, ServerToClientMessage } from '@shared/index';
import type { ClientState } from '@shared/index';

let socket: Socket | null = null;

type Dispatch = React.Dispatch<
  | { type: 'connection:set'; status: ClientState['connectionStatus'] }
  | { type: 'room:update'; payload?: any }
  | { type: 'game:update'; payload?: any }
  | { type: 'persist:setLastRoom'; payload?: string }
  | { type: 'player:set'; payload: { playerId?: string; nickname?: string } }
  | { type: 'view:set'; payload: ClientState['view'] }
  | { type: 'notify:add'; payload: { type: 'info' | 'error'; message: string } }
>;

function getEndpointFromMeta(): string | undefined {
  try {
    const meta = document.querySelector('meta[name="scrabble-endpoint"]') as HTMLMetaElement | null;
    return meta?.content || undefined;
  } catch {
    return undefined;
  }
}

export function connectSocket(dispatch: Dispatch, getState: () => ClientState) {
  if (socket?.connected) return socket;

  dispatch({ type: 'connection:set', status: 'connecting' });

  const url = (import.meta as any).env?.VITE_GAME_SERVER_URL || getEndpointFromMeta() || 'http://localhost:4000';
  socket = io(url, {
    // Allow default transport negotiation (polling -> websocket upgrade)
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect', () => {
    dispatch({ type: 'connection:set', status: 'connected' });

    // Try automatic reconnect if we have persisted info
    const { playerId, lastRoomId } = getState();
    if (playerId && lastRoomId) {
      sendMessage('reconnect', { playerId, lastRoomId });
    }
  });

  socket.on('disconnect', () => {
    dispatch({ type: 'connection:set', status: 'disconnected' });
  });

  socket.on('connect_error', (err) => {
    dispatch({ type: 'notify:add', payload: { type: 'error', message: `WS error: ${err.message}` } });
  });

  // Main unified message channel from server → client.
  socket.on('message', (msg: ServerToClientMessage) => {
    handleServerMessage(msg, dispatch, getState);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
}

export function sendMessage<T extends ClientToServerEnvelope['type']>(type: T, payload: any) {
  if (!socket) return;
  socket.emit('message', { type, payload } as ClientToServerEnvelope);
}

function handleServerMessage(msg: ServerToClientMessage, dispatch: Dispatch, _getState: () => ClientState) {
  switch (msg.type) {
    case 'roomUpdate': {
      dispatch({ type: 'room:update', payload: msg.payload.room });
      dispatch({ type: 'persist:setLastRoom', payload: msg.payload.room?.id });
      // Best-effort inference of playerId if not set yet
      tryInferPlayerId(dispatch, _getState(), msg.payload.room);
      break;
    }
    case 'gameState': {
      dispatch({ type: 'game:update', payload: msg.payload.gameState });
      break;
    }
    case 'fullState': {
      dispatch({ type: 'room:update', payload: msg.payload.room });
      if (msg.payload.gameState) dispatch({ type: 'game:update', payload: msg.payload.gameState });
      tryInferPlayerId(dispatch, _getState(), msg.payload.room);
      break;
    }
    case 'turnUpdate': {
      // Only patch incremental fields to avoid clobbering the latest board/log
      dispatch({
        type: 'game:merge',
        payload: {
          activePlayerId: msg.payload.activePlayerId,
          turnEndsAt: msg.payload.turnEndsAt,
          version: msg.payload.version,
        },
      });
      break;
    }
    case 'moveAccepted': {
      // Apply patch if provided; otherwise rely on next gameState
      dispatch({ type: 'notify:add', payload: { type: 'info', message: 'Coup accepté.' } });
      break;
    }
    case 'invalidMove': {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: `Coup invalide: ${msg.payload.reason}` } });
      break;
    }
    case 'gameEnded': {
      dispatch({ type: 'view:set', payload: 'end' });
      break;
    }
    case 'roomClosed': {
      dispatch({ type: 'room:update', payload: undefined });
      dispatch({ type: 'notify:add', payload: { type: 'info', message: 'La partie a été fermée.' } });
      break;
    }
    case 'error': {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: msg.payload.message } });
      break;
    }
  }
}

function tryInferPlayerId(
  dispatch: Dispatch,
  state: ClientState,
  room?: { players?: Array<{ id: string; nickname: string }> },
) {
  if (!room || !room.players || state.playerId || !state.nickname) return;
  const matches = room.players.filter((p) => p.nickname === state.nickname);
  if (matches.length === 1) {
    dispatch({ type: 'player:set', payload: { playerId: matches[0].id } });
  }
}

