import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = '#3498db',
  text 
}) => {
  const sizeMap = {
    sm: '16px',
    md: '20px',
    lg: '24px'
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem' 
    }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: '2px solid #f3f3f3',
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <span>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
