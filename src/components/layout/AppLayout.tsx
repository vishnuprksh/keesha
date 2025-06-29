import React from 'react';
import { AuthUser } from '../../authService';
import UserHeader from '../UserHeader';

interface AppLayoutProps {
  user?: AuthUser;
  onSignOut?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  onSignOut,
  activeTab,
  onTabChange,
  children
}) => {
  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'transactions', label: '💰 Transactions' },
    { id: 'accounts', label: '🏦 Accounts' },
    { id: 'stats', label: '📊 Stats' },
    { id: 'import', label: '📄 CSV Import' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>💰 Keesha</h1>
            <p>Your Personal Expense Tracker</p>
          </div>
          {user && onSignOut && (
            <div style={{ position: 'absolute', right: 0 }}>
              <UserHeader user={user} onSignOut={onSignOut} />
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
