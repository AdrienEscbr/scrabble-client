import React, { useState } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useClient } from '@context/ClientContext';
import { useSocket } from '@hooks/useSocket';

export const HomeScreen: React.FC = () => {
  const { state, dispatch } = useClient();
  const { api } = useSocket();
  const [roomCode, setRoomCode] = useState('');

  const onCreate = () => {
    if (!state.nickname || state.nickname.length === 0) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un pseudo.' } });
      return;
    }
    api.createRoom(state.nickname, 4);
  };

  const onJoin = () => {
    const code = roomCode.trim().toUpperCase();
    if (!state.nickname || state.nickname.length === 0) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un pseudo.' } });
      return;
    }
    if (!code) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un code de room.' } });
      return;
    }
    api.joinRoom(state.nickname, code);
  };

  const onRejoinLast = () => {
    if (state.playerId && state.lastRoomId) {
      api.reconnect(state.playerId, state.lastRoomId);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6} xl={5}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>ScrabbleIO</Card.Title>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Pseudo</Form.Label>
                <Form.Control
                  placeholder="Votre pseudo (max 15 caractères)"
                  maxLength={15}
                  value={state.nickname || ''}
                  onChange={(e) => dispatch({ type: 'player:set', payload: { nickname: e.target.value } })}
                />
              </Form.Group>
              <div className="d-flex gap-2 mb-3">
                <Button onClick={onCreate}>Créer une room</Button>
                <Button
                  variant="outline-secondary"
                  disabled={!state.playerId || !state.lastRoomId}
                  onClick={onRejoinLast}
                >
                  Rejoindre la dernière room
                </Button>
              </div>

              <Form.Group className="mb-2">
                <Form.Label>Code room</Form.Label>
                <Form.Control
                  placeholder="ABCD"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
              </Form.Group>
              <Button variant="primary" onClick={onJoin}>
                Rejoindre la room
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

