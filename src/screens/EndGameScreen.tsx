import React from 'react';
import { Button, Card, Row, Col, Table } from 'react-bootstrap';
import { useClient } from '@context/ClientContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@hooks/useSocket';

export const EndGameScreen: React.FC = () => {
  const { state, dispatch } = useClient();
  const navigate = useNavigate();
  const { api } = useSocket();
  const room = state.currentRoom;
  const gs = state.gameState;
  const myId = state.playerId;

  if (!room || !gs) return null;

  const rows = Object.entries(gs.scoresByPlayer)
    .map(([pid, score]) => ({ pid, score, name: room.players.find((p) => p.id === pid)?.nickname || pid }))
    .sort((a, b) => b.score - a.score);
  const best = rows[0]?.score ?? 0;
  const myScore = rows.find((r) => r.pid === myId)?.score ?? 0;

  let result: 'Victoire' | 'Défaite' | 'Égalité' = 'Égalité';
  if (myScore === best && rows.filter((r) => r.score === best).length === 1) result = 'Victoire';
  else if (myScore < best) result = 'Défaite';

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Fin de partie</Card.Title>
            <p>
              Résultat: <strong>{result}</strong>
            </p>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Joueur</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.pid}>
                    <td>{r.name}</td>
                    <td>{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {/* TODO: statistiques détaillées si le serveur les fournit */}
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/')}>Retour au menu</Button>
              <Button
                variant="primary"
                onClick={() => {
                  dispatch({ type: 'view:set', payload: 'lobby' });
                  api.toggleReady(room.id, true);
                }}
              >
                Prêt pour rejouer
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

