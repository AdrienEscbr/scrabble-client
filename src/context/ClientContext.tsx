import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import type { ClientState, ViewName, RoomSummary, GameStateSummary } from 'types/index';

const LS_KEY = 'scrabble-client';

type Action =
  | { type: 'connection:set'; status: ClientState['connectionStatus'] }
  | { type: 'persist:hydrate'; payload: Partial<ClientState> }
  | { type: 'player:set'; payload: { playerId?: string; nickname?: string } }
  | { type: 'room:update'; payload?: RoomSummary }
  | { type: 'game:update'; payload?: GameStateSummary }
  | { type: 'game:merge'; payload: Partial<GameStateSummary> }
  | { type: 'view:set'; payload: ViewName }
  | { type: 'persist:setLastRoom'; payload?: string }
  | { type: 'sounds:set'; payload: boolean }
  | { type: 'notify:add'; payload: { id?: string; type: 'info' | 'error'; message: string } }
  | { type: 'notify:remove'; payload: { id: string } };

const initialState: ClientState = {
  connectionStatus: 'disconnected',
  view: 'home',
  notifications: [],
  soundsEnabled: false,
};

function reducer(state: ClientState, action: Action): ClientState {
  switch (action.type) {
    case 'connection:set':
      return { ...state, connectionStatus: action.status };
    case 'persist:hydrate': {
      return { ...state, ...action.payload };
    }
    case 'player:set':
      return { ...state, ...action.payload };
    case 'room:update': {
      const currentRoom = action.payload;
      let view: ViewName = state.view;
      if (!currentRoom) {
        view = 'home';
      } else {
        // Map both server statuses (waiting/playing/finished) and client statuses
        const status = String(currentRoom.status);
        if (status === 'lobby' || status === 'waiting') view = 'lobby';
        else if (status === 'in-game' || status === 'playing') view = 'game';
        else if (status === 'ended' || status === 'finished') view = 'end';
      }
      return { ...state, currentRoom, view };
    }
    case 'game:update': {
      const gameState = action.payload;
      let view: ViewName = state.view;
      if (gameState) {
        view = 'game';
      }
      return { ...state, gameState, view };
    }
    case 'game:merge': {
      return { ...state, gameState: { ...(state.gameState || ({} as GameStateSummary)), ...action.payload } };
    }
    case 'view:set':
      return { ...state, view: action.payload };
    case 'persist:setLastRoom':
      return { ...state, lastRoomId: action.payload };
    case 'sounds:set':
      return { ...state, soundsEnabled: action.payload };
    case 'notify:add': {
      const id = action.payload.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return { ...state, notifications: [...state.notifications, { ...action.payload, id }] };
    }
    case 'notify:remove':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload.id) };
    default:
      return state;
  }
}

const ClientContext = createContext<{ state: ClientState; dispatch: React.Dispatch<Action> } | undefined>(
  undefined,
);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'persist:hydrate', payload: parsed });
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // Persist meaningful changes
  useEffect(() => {
    const toPersist = {
      playerId: state.playerId,
      nickname: state.nickname,
      lastRoomId: state.lastRoomId,
      soundsEnabled: state.soundsEnabled,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(toPersist));
    } catch (_) {
      // ignore
    }
  }, [state.playerId, state.nickname, state.lastRoomId, state.soundsEnabled]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClient must be used within ClientProvider');
  return ctx;
}



