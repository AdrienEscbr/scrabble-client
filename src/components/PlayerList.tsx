import React from 'react';
import type { PlayerSummary } from 'types/index';

export const PlayerList: React.FC<{
  players: PlayerSummary[];
  activePlayerId?: string;
}> = ({ players, activePlayerId }) => {
  return (
    <div>
      <h6>Joueurs</h6>
      <ul className="list-group">
        {players.map((p) => (
          <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span className={activePlayerId === p.id ? 'active-player' : ''}>{p.nickname}</span>
              {p.host ? <span className="badge text-bg-warning ms-2">Host</span> : null}
              {p.ready ? <span className="badge text-bg-success ms-2">Prêt</span> : <span className="badge text-bg-secondary ms-2">En attente</span>}
            </div>
            <span className={`badge ${p.connected ? 'text-bg-success' : 'text-bg-secondary'}`}>
              {p.connected ? '●' : '○'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};



