import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomeScreen } from 'screens/HomeScreen';
import { LobbyScreen } from 'screens/LobbyScreen';
import { GameScreen } from 'screens/GameScreen';
import { EndGameScreen } from 'screens/EndGameScreen';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/room/:roomId/lobby" element={<LobbyScreen />} />
      <Route path="/room/:roomId/game" element={<GameScreen />} />
      <Route path="/room/:roomId/end" element={<EndGameScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


