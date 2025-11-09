import React from 'react';

export const ActionButtons: React.FC<{
  isMyTurn: boolean;
  canValidate: boolean;
  onValidate: () => void;
  onPass: () => void;
  onExchange: () => void;
  onCancel: () => void;
}> = ({ isMyTurn, canValidate, onValidate, onPass, onExchange, onCancel }) => {
  return (
    <div className="d-flex gap-2 mt-2">
      <button className="btn btn-success" disabled={!isMyTurn || !canValidate} onClick={onValidate}>
        Valider
      </button>
      <button className="btn btn-outline-secondary" disabled={!isMyTurn} onClick={onPass}>
        Passer
      </button>
      <button className="btn btn-outline-primary" disabled={!isMyTurn} onClick={onExchange}>
        Échanger
      </button>
      <button className="btn btn-outline-danger" onClick={onCancel}>
        Annuler
      </button>
    </div>
  );
};

