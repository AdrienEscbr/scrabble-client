import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useClient } from '@context/ClientContext';

export const NotificationBar: React.FC = () => {
  const { state, dispatch } = useClient();

  useEffect(() => {
    if (state.notifications.length === 0) return;
    const timers = state.notifications.map((n) =>
      setTimeout(() => dispatch({ type: 'notify:remove', payload: { id: n.id } }), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [state.notifications, dispatch]);

  return (
    <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 1080, maxWidth: 420 }}>
      {state.notifications.map((n) => (
        <Alert key={n.id} variant={n.type === 'error' ? 'danger' : 'info'} className="mb-2 shadow">
          {n.message}
        </Alert>
      ))}
    </div>
  );
};

