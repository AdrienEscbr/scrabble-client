import React, { useMemo, useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useClient } from '@context/ClientContext';
import { Board } from '@components/Board';
import { Rack } from '@components/Rack';
import { Timer } from '@components/Timer';
import { ActionButtons } from '@components/ActionButtons';
import { useSocket } from '@hooks/useSocket';

export const GameScreen: React.FC = () => {
  const { state } = useClient();
  const { api } = useSocket();
  const roomId = state.currentRoom?.id!;
  const gs = state.gameState;

  const isMyTurn = gs?.activePlayerId === state.playerId;

  // Local placements before validation
  const [selectedTileId, setSelectedTileId] = useState<string | undefined>(undefined);
  const [placements, setPlacements] = useState<
    { x: number; y: number; letter: string; points: number; tileId: string }[]
  >([]);

  const [exchangeMode, setExchangeMode] = useState(false);
  const [exchangeSet, setExchangeSet] = useState<Set<string>>(new Set());

  const [rackOrder, setRackOrder] = useState<string[]>([]);
  const rackTiles = useMemo(() => {
    const used = new Set(placements.map((p) => p.tileId));
    const available = (gs?.myRack ?? []).filter((t) => !used.has(t.tileId));
    const orderMap = new Map(rackOrder.map((id, idx) => [id, idx] as const));
    return available
      .slice()
      .sort((a, b) => (orderMap.get(a.tileId) ?? Number.MAX_SAFE_INTEGER) - (orderMap.get(b.tileId) ?? Number.MAX_SAFE_INTEGER));
  }, [gs?.myRack, placements, rackOrder]);

  useEffect(() => {
    const ids = (gs?.myRack ?? []).map((t) => t.tileId);
    setRackOrder((prev) => {
      if (prev.length === 0) return ids;
      const setIds = new Set(ids);
      const filtered = prev.filter((id) => setIds.has(id));
      for (const id of ids) if (!filtered.includes(id)) filtered.push(id);
      return filtered;
    });
  }, [gs?.myRack]);
  

  // Ensure first rack tile is always selected; if empty, no selection
  useEffect(() => {
    const first = rackTiles[0]?.tileId;
    setSelectedTileId(first);
  }, [rackTiles]);


  const onPlace = (x: number, y: number) => {
    if (!isMyTurn || exchangeMode) return;
    const cell = gs?.board[y]?.[x];
    if (!cell || cell.letter) return; // occupied
    const tile = rackTiles.find((t) => t.tileId === selectedTileId);
    if (!tile) return;
    setPlacements((prev) => [...prev.filter((p) => !(p.x === x && p.y === y)), { x, y, letter: tile.letter, points: tile.points, tileId: tile.tileId }]);
  };

  const onSelectRack = (tileId: string) => {
    if (exchangeMode) {
      setExchangeSet((prev) => {
        const next = new Set(prev);
        if (next.has(tileId)) next.delete(tileId);
        else next.add(tileId);
        return next;
      });
      return;
    }
    setRackOrder((prev) => { const rest = prev.filter((id) => id !== tileId); return [tileId, ...rest]; });
  };

  const onValidate = () => {
    if (!isMyTurn || placements.length === 0) return;
    const payload = placements.map((p) => ({ x: p.x, y: p.y, tileId: p.tileId }));
    api.playMove({ roomId, action: 'play', placements: payload });
    setPlacements([]);
    setSelectedTileId(undefined);
  };

  const onPass = () => {
    if (!isMyTurn) return;
    api.playMove({ roomId, action: 'pass' });
  };

  const onExchange = () => {
    if (!isMyTurn) return;
    if (!exchangeMode) {
      setExchangeMode(true);
      setExchangeSet(new Set());
      setPlacements([]);
      setSelectedTileId(undefined);
      return;
    }
    const ids = [...exchangeSet];
    if (ids.length > 0) {
      api.playMove({ roomId, action: 'exchange', tileIdsToExchange: ids });
    }
    setExchangeMode(false);
    setExchangeSet(new Set());
  };

  const onCancel = () => {
    setPlacements([]);
    setExchangeMode(false);
    setExchangeSet(new Set());
    setSelectedTileId(undefined);
  };

  const canValidate = placements.length > 0 && isMyTurn && !exchangeMode;

  if (!gs) return null;

  // Sidebar scores
  const scoreRows = Object.entries(gs.scoresByPlayer)
    .map(([pid, score]) => ({ pid, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <Row>
      <Col md={7} lg={8} className="d-flex justify-content-center">
        <Card className="shadow-sm">
          <Card.Body>
            <Board
              board={gs.board}
              placements={placements}
              onPlace={onPlace}
              onRemovePlacement={(x, y) => { if (!isMyTurn) return; setPlacements((prev) => prev.filter((p) => !(p.x === x && p.y === y))); }}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={3} lg={3} className="sidebar">
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h6 className="d-flex justify-content-between align-items-center">
              <span>Tour</span>
              <span className={isMyTurn ? 'text-success' : 'text-muted'} style={{ fontSize: 13 }}>
                {isMyTurn ? 'A vous de jouer' : `Tour de ${state.currentRoom?.players.find((p) => p.id === gs.activePlayerId)?.nickname || gs.activePlayerId}`}
              </span>
            </h6>
            <Timer turnEndsAt={gs.turnEndsAt} />
            <div className="text-muted small mt-2">Lettres restantes: <strong>{gs.bagCount ?? '-'}</strong></div>
          </Card.Body>
        </Card>
        <Card className="mb-3 shadow-sm">
          <Card.Body>
            <h6>Scores</h6>
            <ul className="list-group">
              {scoreRows.map((r) => (
                <li key={r.pid} className="list-group-item d-flex justify-content-between">
                  <span>{state.currentRoom?.players.find((p) => p.id === r.pid)?.nickname || r.pid}</span>
                  <strong>{r.score}</strong>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
        <Card className="shadow-sm">
          <Card.Body>
            <h6>Historique</h6>
            <ul className="small ps-3 log-panel mb-0">
              {gs.log.map((l, i) => (
                <li key={`${i}-${l.playerId}-${l.summary}`}>{l.summary}</li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} className="mt-3">
        <Card className="shadow-sm">
          <Card.Body>
            <h6>Rack</h6>
            <Rack
              tiles={rackTiles}
              selectedTileId={selectedTileId}
              onSelect={onSelectRack}
              disabled={!isMyTurn}
              onReorder={(ids) => setRackOrder(ids)}
            />
            <div className="mt-2">
              {exchangeMode ? (
                <span className="text-muted">Sélectionnez les tuiles à échanger puis cliquez sur Échanger.</span>
              ) : null}
            </div>
            <ActionButtons
              isMyTurn={!!isMyTurn}
              canValidate={canValidate}
              onValidate={onValidate}
              onPass={onPass}
              onExchange={onExchange}
              onCancel={onCancel}
            />
            <div className="mt-2 d-flex">
              <button
                className="btn btn-outline-danger btn-sm ms-auto"
                onClick={() => {
                  if (!roomId) return;
                  if (confirm('Quitter la partie et fermer la room pour tous ?')) {
                    api.leaveRoom(roomId);
                  }
                }}
                title="Quitter la partie et fermer la room"
              >
                Quitter la partie
              </button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};





