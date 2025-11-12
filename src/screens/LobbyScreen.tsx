import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useClient } from 'context/ClientContext';
import { useNavigate } from 'react-router-dom';
import { PlayerList } from 'components/PlayerList';
import { useSocket } from 'hooks/useSocket';

export const LobbyScreen: React.FC = () => {
  const { state, dispatch } = useClient();
  const navigate = useNavigate();
  const { api } = useSocket();
  const room = state.currentRoom;
  if (!room) return null;

  const me = room.players.find((p) => p.id === state.playerId);
  const isHost = room.hostId === state.playerId;
  const canStart = isHost && room.players.length >= 2 && room.players.every((p) => p.ready);

  return (
    <Row>
      <Col md={8} lg={9}>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title className="d-flex align-items-center gap-2">
              Room: <strong>{room.id}</strong>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(room.id);
                  } catch (_){}
                }}
                title="Copier le code"
              >
                Copier
              </button>
            </Card.Title>
            <p className="text-muted">Joueurs connectés: {room.players.filter((p) => p.connected).length} / {room.maxPlayers}</p>
            <PlayerList players={room.players} activePlayerId={state.gameState?.activePlayerId} />
            <div className="mt-3 d-flex gap-2">
              <Button
                variant={me?.ready ? 'outline-secondary' : 'success'}
                onClick={() => api.toggleReady(room.id, !me?.ready)}
              >
                {me?.ready ? 'Pas prêt' : 'Prêt'}
              </Button>
              {isHost ? (
                <Button variant="primary" onClick={() => api.startGame(room.id)} disabled={!canStart} title={!canStart ? 'Au moins 2 joueurs et tous prêts requis' : ''}>
                  Lancer la partie
                </Button>
              ) : null}
            </div>
            <p className="mt-3 text-muted">En attente de tous les joueurs…</p>
            <div className="mt-2">
              <Button
                variant="outline-danger"
                onClick={() => { api.leaveRoom(room.id); dispatch({ type: 'room:update', payload: undefined }); dispatch({ type: 'view:set', payload: 'home' }); navigate('/'); }}
              >
                Quitter la room
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

