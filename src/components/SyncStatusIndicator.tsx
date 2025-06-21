import React from 'react';

interface SyncStatusIndicatorProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="sync-status loading">
        <span className="sync-icon">🔄</span>
        <span>Syncing data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sync-status error">
        <span className="sync-icon">⚠️</span>
        <span>Sync error: {error}</span>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-retry">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="sync-status synced">
      <span className="sync-icon">✅</span>
      <span>All data synced</span>
    </div>
  );
};

export default SyncStatusIndicator;
