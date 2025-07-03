import React, { useState, useRef } from 'react';
import { CSVRow, Account } from '../../types';
import { getAffectedAccountBalances } from '../../utils/balanceCalculator';
import { formatAmount } from '../../utils/formatters';
import AccountSelect from '../forms/AccountSelect';

interface DraggableCSVRowProps {
  row: CSVRow;
  index: number;
  accounts: Account[];
  runningBalances: { [accountId: string]: number };
  onUpdateRow: (index: number, field: keyof CSVRow, value: string) => void;
  onRemoveRow: (index: number) => void;
  onReorderRows: (fromIndex: number, toIndex: number) => void;
  onInsertRow: (index: number, rowToCopy?: CSVRow) => void;
  onToggleSelection: (index: number) => void;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDragOver: (index: number) => void;
}

const DraggableCSVRow: React.FC<DraggableCSVRowProps> = ({
  row,
  index,
  accounts,
  runningBalances,
  onUpdateRow,
  onRemoveRow,
  onReorderRows,
  onInsertRow,
  onToggleSelection,
  draggedIndex,
  onDragStart,
  onDragEnd,
  onDragOver
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [insertPosition, setInsertPosition] = useState<'top' | 'bottom' | null>(null);
  const rowRef = useRef<HTMLTableRowElement>(null);

  const affectedBalances = getAffectedAccountBalances(row, accounts, runningBalances, true);
  const isDragging = draggedIndex === index;

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      const rect = rowRef.current?.getBoundingClientRect();
      if (rect) {
        const middle = rect.top + rect.height / 2;
        const position = e.clientY < middle ? 'top' : 'bottom';
        setInsertPosition(position);
        setIsDragOver(true);
        onDragOver(index);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragOver(false);
        setInsertPosition(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setInsertPosition(null);
    
    if (draggedIndex !== null && draggedIndex !== index) {
      let targetIndex = index;
      if (insertPosition === 'bottom') {
        targetIndex = index + 1;
      }
      onReorderRows(draggedIndex, targetIndex);
    }
    onDragEnd();
  };

  return (
    <>
      {isDragOver && insertPosition === 'top' && (
        <tr className="drag-insert-indicator">
          <td colSpan={10}>
            <div className="insert-line">
              <span className="insert-text">Drop here to insert</span>
            </div>
          </td>
        </tr>
      )}
      
      <tr
        ref={rowRef}
        className={`csv-row ${row.isValid ? 'valid-row' : 'invalid-row'} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
      >
        <td className="drag-handle">
          <span className="drag-icon" title="Drag to reorder">⋮⋮</span>
        </td>
        
        <td className="select-column">
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggleSelection(index)}
            disabled={!row.isValid}
            title={row.isValid ? "Select for import" : "Cannot select invalid row"}
          />
        </td>
        
        <td>
          <input
            type="text"
            value={row.title}
            onChange={(e) => onUpdateRow(index, 'title', e.target.value)}
            className={row.errors.some(e => e.includes('Title')) ? 'error' : ''}
            placeholder="Transaction title"
          />
        </td>
        
        <td>
          <input
            type="number"
            step="0.01"
            value={row.amount}
            onChange={(e) => onUpdateRow(index, 'amount', e.target.value)}
            className={row.errors.some(e => e.includes('Amount')) ? 'error' : ''}
            placeholder="0.00"
          />
        </td>
        
        <td>
          <AccountSelect
            accounts={accounts}
            value={row.fromAccountId}
            onChange={(value) => onUpdateRow(index, 'fromAccountId', value)}
            placeholder="Select From Account"
            name={`fromAccount-${index}`}
            error={row.errors.some(e => e.includes('From account'))}
          />
        </td>
        
        <td>
          <AccountSelect
            accounts={accounts}
            value={row.toAccountId}
            onChange={(value) => onUpdateRow(index, 'toAccountId', value)}
            placeholder="Select To Account"
            excludeAccount={row.fromAccountId}
            name={`toAccount-${index}`}
            error={row.errors.some(e => e.includes('To account'))}
          />
        </td>
        
        <td>
          <input
            type="date"
            value={row.date}
            onChange={(e) => onUpdateRow(index, 'date', e.target.value)}
            className={row.errors.some(e => e.includes('Date')) ? 'error' : ''}
          />
        </td>
        
        <td>
          <input
            type="text"
            value={row.description}
            onChange={(e) => onUpdateRow(index, 'description', e.target.value)}
            placeholder="Optional description"
          />
        </td>
        
        <td className="balance-column">
          {affectedBalances.length > 0 && (
            <div className="balance-display">
              {affectedBalances.map((balance, idx) => (
                <div key={balance.accountId} className="balance-item">
                  <span className="account-name">{balance.accountName}:</span>
                  <span className={`balance-amount ${balance.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatAmount(balance.balance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </td>
        
        <td className={`status ${row.isValid ? 'valid' : 'invalid'}`}>
          {row.isValid ? (
            <span className="status-valid">✓ Valid</span>
          ) : (
            <div className="status-invalid">
              <span>✗ Invalid</span>
              <div className="error-list">
                {row.errors.map((error, i) => (
                  <div key={i} className="error-item">{error}</div>
                ))}
              </div>
            </div>
          )}
        </td>
        
        <td className="actions-column">
          <div className="action-buttons">
            <button
              onClick={() => onInsertRow(index, row)}
              className="insert-btn"
              title="Copy this transaction below"
            >
              ➕
            </button>
            <button
              onClick={() => onRemoveRow(index)}
              className="remove-btn"
              title="Remove this transaction"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
      
      {isDragOver && insertPosition === 'bottom' && (
        <tr className="drag-insert-indicator">
          <td colSpan={10}>
            <div className="insert-line">
              <span className="insert-text">Drop here to insert</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default DraggableCSVRow;
