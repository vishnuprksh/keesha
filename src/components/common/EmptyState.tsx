import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📝', 
  title, 
  description, 
  action 
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#666'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h3 style={{ 
        color: '#333', 
        marginBottom: '0.5rem',
        fontSize: '1.2rem'
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ 
          margin: '0.5rem 0 1.5rem 0',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
