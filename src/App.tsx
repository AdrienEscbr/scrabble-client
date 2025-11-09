import React, { useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { AppRoutes } from 'router/index';
import { useClient } from 'context/ClientContext';
import { NotificationBar } from 'components/NotificationBar';
import { SoundToggle } from 'components/SoundToggle';
import { useSocket } from 'hooks/useSocket';
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  const { state } = useClient();
  useSocket();
  const navigate = useNavigate();

  // Navigation logic reacting to state changes
  useEffect(() => {
    const roomId = state.currentRoom?.id;
    if (!roomId) {
      if (state.view !== 'home') navigate('/');
      return;
    }
    if (state.view === 'lobby') navigate(`/room/${roomId}/lobby`);
    if (state.view === 'game') navigate(`/room/${roomId}/game`);
    if (state.view === 'end') navigate(`/room/${roomId}/end`);
  }, [state.view, state.currentRoom?.id, navigate]);

  return (
    <>
      <Navbar bg="light" className="mb-3">
        <Container fluid>
          <Navbar.Brand>ScrabbleIO</Navbar.Brand>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">
              WS: <strong>{state.connectionStatus}</strong>
            </span>
            <SoundToggle />
          </div>
        </Container>
      </Navbar>
      <Container fluid>
        <AppRoutes />
      </Container>
      <NotificationBar />
    </>
  );
};

export default App;


