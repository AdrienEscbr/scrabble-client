// Shared types between app layers

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface PlayerSummary {
  id: string;
  nickname: string;
  connected: boolean;
  ready: boolean;
  host?: boolean;
  score?: number;
}

export type RoomStatusClient = 'lobby' | 'in-game' | 'ended' | 'waiting' | 'playing' | 'finished';

export interface RoomSummary {
  id: string; // public room code (e.g., ABCD)
  maxPlayers: number;
  players: PlayerSummary[];
  hostId: string;
  status: RoomStatusClient;
}

export type BonusType = 'DL' | 'TL' | 'DW' | 'TW' | null;

export interface Tile {
  tileId: string; // unique id on server
  letter: string;
  points: number;
}

export interface BoardCell {
  letter?: string; // placed letter
  points?: number; // points of the letter
  fromRack?: boolean; // true if placed locally awaiting validation
  bonus?: BonusType; // board bonus layout info
}

export interface GameStateSummary {
  board: BoardCell[][]; // 15x15
  myRack: Tile[]; // only the current player's rack
  scoresByPlayer: Record<string, number>;
  activePlayerId: string;
  turnEndsAt?: number; // epoch ms
  bagCount?: number;
  log: Array<{
    playerId: string;
    action: 'play' | 'pass' | 'exchange';
    summary: string;
  }>;
  version?: number;
}

export interface MoveSummary {
  playerId: string;
  action: 'play' | 'pass' | 'exchange';
  placements?: { x: number; y: number; tileId: string }[];
  tileIdsToExchange?: string[];
}

export type ViewName = 'home' | 'lobby' | 'game' | 'end';

export interface PersistedState {
  playerId?: string;
  nickname?: string;
  lastRoomId?: string;
  soundsEnabled?: boolean;
}

export interface ClientState extends PersistedState {
  connectionStatus: ConnectionStatus;
  currentRoom?: RoomSummary;
  gameState?: GameStateSummary;
  view: ViewName;
  notifications: { id: string; type: 'info' | 'error'; message: string }[];
}

export type ServerToClientMessage =
  | { type: 'roomUpdate'; payload: { room: RoomSummary } }
  | { type: 'gameState'; payload: { roomId: string; gameState: GameStateSummary } }
  | { type: 'fullState'; payload: { room: RoomSummary; gameState?: GameStateSummary } }
  | { type: 'turnUpdate'; payload: { roomId: string; activePlayerId: string; turnEndsAt: number; version: number } }
  | { type: 'moveAccepted'; payload: { roomId: string; move: MoveSummary; gameStatePatch?: any } }
  | { type: 'invalidMove'; payload: { roomId: string; reason: string; details?: any } }
  | { type: 'gameEnded'; payload: { roomId: string; scores: any; statsByPlayer: any; winnerIds: string[] } }
  | { type: 'roomClosed'; payload: { roomId: string; reason?: string } }
  | { type: 'error'; payload: { code: string; message: string } };

export type ClientToServerEnvelope = {
  type:
    | 'createRoom'
    | 'joinRoom'
    | 'reconnect'
    | 'toggleReady'
    | 'startGame'
    | 'playMove'
    | 'leaveRoom';
  payload: any;
};
