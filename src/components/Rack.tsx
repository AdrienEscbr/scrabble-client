import React, { useRef, useState } from 'react';
import type { Tile } from '@shared/index';

export const Rack: React.FC<{
  tiles: Tile[];
  selectedTileId?: string;
  onSelect: (tileId: string) => void;
  disabled?: boolean;
  onReorder?: (nextOrder: string[]) => void;
}> = ({ tiles, selectedTileId, onSelect, disabled, onReorder }) => {
  const dragSrc = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (tileId: string) => {
    dragSrc.current = tileId;
  };
  const handleDrop = (targetId: string) => {
    const sourceId = dragSrc.current;
    dragSrc.current = null;
    setDragOver(null);
    if (!sourceId || sourceId === targetId || !onReorder) return;
    const ids = tiles.map((t) => t.tileId);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <div>
      {tiles.map((t) => (
        <span
          key={t.tileId}
          className={`rack-tile ${selectedTileId === t.tileId ? 'selected' : ''}`}
          onClick={() => !disabled && onSelect(t.tileId)}
          role="button"
          draggable={!disabled}
          onDragStart={() => handleDragStart(t.tileId)}
          onDragOver={(e) => {
            if (disabled) return;
            e.preventDefault();
            setDragOver(t.tileId);
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => handleDrop(t.tileId)}
          style={{ outline: dragOver === t.tileId ? '2px dashed #6c757d' : undefined }}
        >
          {t.letter || '?'}
        </span>
      ))}
    </div>
  );
};


