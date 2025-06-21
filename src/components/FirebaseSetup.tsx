import React, { useState } from 'react';

interface FirebaseSetupProps {
  onSetupComplete: () => void;
}

const FirebaseSetup: React.FC<FirebaseSetupProps> = ({ onSetupComplete }) => {
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real application, you would save these to environment variables
    // For now, we'll store them in localStorage as a temporary solution
    localStorage.setItem('firebase-config', JSON.stringify(config));
    alert('Firebase configuration saved! Please restart the application.');
    onSetupComplete();
  };

  const isComplete = Object.values(config).every(value => value.trim() !== '');

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔧 Firebase Setup Required</h2>
      <p>To use Firebase with Keesha, please provide your Firebase project configuration:</p>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>⚠️ Authorization Domain Issue Detected</h3>
        <p>If you're seeing an "unauthorized-domain" error, follow these steps:</p>
        <ol>
          <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
          <li>Select your project: <strong>keesha-10560</strong></li>
          <li>Go to <strong>Authentication</strong> → <strong>Settings</strong> tab</li>
          <li>In <strong>Authorized domains</strong>, add: <code>localhost</code> and <code>127.0.0.1</code></li>
          <li>Go to <strong>Authentication</strong> → <strong>Sign-in method</strong></li>
          <li>Enable <strong>Google</strong> sign-in provider</li>
        </ol>
        <p>Then refresh this page and try signing in again.</p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3>How to get your Firebase config:</h3>
        <ol>
          <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
          <li>Select your project (or create a new one)</li>
          <li>Click on "Project Settings" (gear icon)</li>
          <li>Scroll down to "Your apps" and click "Web app"</li>
          <li>Copy the configuration values from the Firebase SDK snippet</li>
        </ol>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="apiKey">API Key:</label>
          <input
            id="apiKey"
            type="text"
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="AIza..."
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="authDomain">Auth Domain:</label>
          <input
            id="authDomain"
            type="text"
            value={config.authDomain}
            onChange={(e) => handleInputChange('authDomain', e.target.value)}
            placeholder="your-project.firebaseapp.com"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="projectId">Project ID:</label>
          <input
            id="projectId"
            type="text"
            value={config.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            placeholder="your-project-id"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="storageBucket">Storage Bucket:</label>
          <input
            id="storageBucket"
            type="text"
            value={config.storageBucket}
            onChange={(e) => handleInputChange('storageBucket', e.target.value)}
            placeholder="your-project.appspot.com"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="messagingSenderId">Messaging Sender ID:</label>
          <input
            id="messagingSenderId"
            type="text"
            value={config.messagingSenderId}
            onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
            placeholder="123456789"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div>
          <label htmlFor="appId">App ID:</label>
          <input
            id="appId"
            type="text"
            value={config.appId}
            onChange={(e) => handleInputChange('appId', e.target.value)}
            placeholder="1:123456789:web:abcdef..."
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isComplete}
          style={{
            padding: '1rem',
            backgroundColor: isComplete ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            marginTop: '1rem'
          }}
        >
          Save Configuration
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Alternative: Use Environment Variables</h4>
        <p>You can also set up Firebase configuration using environment variables in a <code>.env</code> file:</p>
        <pre style={{ backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
{`REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id`}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseSetup;
