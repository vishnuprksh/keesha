import React from 'react';

interface LoginPageProps {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignIn, loading, error, onClearError }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💰 Keesha
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem',
            margin: 0
          }}>
            Your Personal Expense Tracker
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Welcome!</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Sign in with your Google account to start tracking your expenses and managing your finances.
          </p>
        </div>

        {error && (
          <div style={{
            background: error.includes('unauthorized-domain') ? '#fff3cd' : '#fee',
            color: error.includes('unauthorized-domain') ? '#856404' : '#c33',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: error.includes('unauthorized-domain') ? '1px solid #ffeaa7' : '1px solid #fcc',
            textAlign: 'left'
          }}>
            {error.includes('unauthorized-domain') ? (
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>🔒 Domain Authorization Required</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                  Your Firebase project needs to authorize this domain for Google sign-in.
                </p>
                <ol style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                  <li>Go to <a href="https://console.firebase.google.com/project/keesha-10560/authentication/settings" target="_blank" rel="noopener noreferrer" style={{ color: '#856404' }}>Firebase Console</a></li>
                  <li>Go to <strong>Authentication</strong> → <strong>Settings</strong></li>
                  <li>Add <code>localhost</code> and <code>127.0.0.1</code> to Authorized domains</li>
                  <li>Enable <strong>Google</strong> sign-in provider in Sign-in method tab</li>
                  <li>Refresh this page and try again</li>
                </ol>
              </div>
            ) : (
              <p style={{ margin: 0 }}>{error}</p>
            )}
            <button 
              onClick={onClearError}
              style={{
                background: 'none',
                border: 'none',
                color: error.includes('unauthorized-domain') ? '#856404' : '#c33',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '0.5rem'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <button
          onClick={onSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: loading ? '#ccc' : 'white',
            border: '2px solid #ddd',
            borderRadius: '12px',
            fontSize: '1.1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Signing in...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Features:</h4>
          <ul style={{ textAlign: 'left', color: '#666', fontSize: '0.9rem', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Track income and expenses</li>
            <li>Manage multiple accounts</li>
            <li>Real-time data sync</li>
            <li>Import from CSV files</li>
            <li>Detailed statistics and reports</li>
          </ul>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
