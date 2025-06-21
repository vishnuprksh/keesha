import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  onDismiss,
  type = 'error'
}) => {
  const getColors = () => {
    switch (type) {
      case 'warning':
        return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'info':
        return { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' };
      default:
        return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      background: colors.bg,
      color: colors.color,
      padding: '1rem',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{message}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'none',
              border: `1px solid ${colors.color}`,
              color: colors.color,
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: colors.color,
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0 0.25rem'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
