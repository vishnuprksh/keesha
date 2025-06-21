import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface PageContainerProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  loading,
  error,
  onRetry,
  headerActions,
  children
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={onRetry} 
      />
    );
  }

  return (
    <div className="page-container">
      {(title || description || headerActions) && (
        <div className="page-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <div>
            {title && (
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                {title}
              </h1>
            )}
            {description && (
              <p style={{ margin: 0, color: '#666' }}>
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="page-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
