import { useEffect, useMemo, useRef } from 'react';
import { connectSocket, disconnectSocket, sendMessage } from 'services/socket';
import { useClient } from 'context/ClientContext';

export function useSocket() {
  const { state, dispatch } = useClient();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    // Connect on mount
    connectSocket(dispatch as any, () => stateRef.current);
    return () => {
      disconnectSocket();
    };
  }, []);

  const api = useMemo(() => {
    return {
      createRoom: (nickname: string, maxPlayers = 4) =>
        sendMessage('createRoom', { nickname, maxPlayers, playerId: stateRef.current.playerId }),
      joinRoom: (nickname: string, roomId: string) =>
        sendMessage('joinRoom', { nickname, roomId, playerId: stateRef.current.playerId }),
      reconnect: (playerId: string, lastRoomId: string) => sendMessage('reconnect', { playerId, lastRoomId }),
      toggleReady: (roomId: string, ready: boolean) => sendMessage('toggleReady', { roomId, ready }),
      toggleReady: (roomId: string, ready: boolean) =>
        sendMessage('toggleReady', { roomId, ready, playerId: stateRef.current.playerId }),
      startGame: (roomId: string) =>
        sendMessage('startGame', { roomId, playerId: stateRef.current.playerId }),
      playMove: (args: {
        roomId: string;
        action: 'play' | 'pass' | 'exchange';
        placements?: { x: number; y: number; tileId: string }[];
        tileIdsToExchange?: string[];
      }) => sendMessage('playMove', args),
      leaveRoom: (roomId: string) => sendMessage('leaveRoom', { roomId }),
    };
  }, []);

  return { connectionStatus: state.connectionStatus, api } as const;
}

