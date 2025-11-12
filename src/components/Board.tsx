import React from 'react';
import type { BoardCell } from 'types/index';

type Placement = { x: number; y: number; letter: string; points: number; tileId: string };

export const Board: React.FC<{
  board: BoardCell[][];
  placements: Placement[];
  onPlace: (x: number, y: number) => void;
  onRemovePlacement?: (x: number, y: number) => void;
  onDropFromRack?: (x: number, y: number, tileId: string) => void;
}> = ({ board, placements, onPlace, onRemovePlacement, onDropFromRack }) => {
  const placedMap = new Map<string, Placement>();
  for (const p of placements) placedMap.set(`${p.x},${p.y}`, p);

  return (
    <div className="board">
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((cell, x) => {
            const key = `${x},${y}`;
            const placed = placedMap.get(key);
            // If there is a placed tile for this turn, use it; otherwise use the board cell letter.
            // Only render '?' when the tile's letter is an explicit empty string (joker).
            const raw = placed ? placed.letter : cell.letter;
            const letter = raw === '' ? '?' : (raw ?? '');
            const value = placed ? placed.points : (cell.points ?? undefined);
            const bonusClass = cell.bonus ? `bonus-${cell.bonus}` : '';
            return (
              <div
                key={key}
                className={`board-cell ${bonusClass} ${placed ? 'placement-local' : ''}`}
                onClick={() => onPlace(x, y)}
                onContextMenu={(e) => {
                  if (placed && onRemovePlacement) {
                    e.preventDefault();
                    onRemovePlacement(x, y);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const tileId = e.dataTransfer?.getData('text/plain');
                  if (tileId && onDropFromRack) onDropFromRack(x, y, tileId);
                }}
                title={cell.bonus || ''}
              >
                {letter}
                {letter && letter !== '?' && value != null ? (
                  <span className="tile-points">{value}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};



