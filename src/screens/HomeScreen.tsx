import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useClient } from 'context/ClientContext';
import { useSocket } from 'hooks/useSocket';

export const HomeScreen: React.FC = () => {
  const { state, dispatch } = useClient();
  const { api } = useSocket();
  const [roomCode, setRoomCode] = useState('');

  const onCreate = () => {
    const nick = (state.nickname || '').trim();
    if (!nick) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un pseudo.' } });
      return;
    }
    api.createRoom(nick, 4);
  };

  const onJoin = () => {
    const nick = (state.nickname || '').trim();
    const code = roomCode.trim().toUpperCase();
    if (!nick) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un pseudo.' } });
      return;
    }
    if (!code) {
      dispatch({ type: 'notify:add', payload: { type: 'error', message: 'Veuillez saisir un code de room.' } });
      return;
    }
    api.joinRoom(nick, code);
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6} xl={5}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>ScrabbleIO</Card.Title>

            {/* TOUT est dans le même <Form> et le même return(...) */}
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                onJoin();
              }}
            >
              <Form.Group className="mb-3" controlId="nickname">
                <Form.Label>Pseudo</Form.Label>
                <Form.Control
                  placeholder="Votre pseudo (max 15 caractères)"
                  maxLength={15}
                  value={state.nickname || ''}
                  onChange={(e) => dispatch({ type: 'player:set', payload: { nickname: e.target.value } })}
                />
              </Form.Group>

              <div className="d-flex gap-2 mb-3">
                <Button type="button" onClick={onCreate} variant="success">
                  Créer une room
                </Button>
              </div>

              <Form.Group className="mb-2" controlId="roomCode">
                <Form.Label>Rejoindre une room</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="ABCD"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  />
                  <Button type="submit" variant="primary">
                    Rejoindre
                  </Button>
                </InputGroup>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};
