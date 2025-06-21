import React, { useState } from 'react';
import { AuthUser } from '../authService';

interface UserHeaderProps {
  user: AuthUser;
  onSignOut: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onSignOut }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      position: 'relative'
    }}>
      <span style={{ color: '#666', fontSize: '0.9rem' }}>
        Welcome back!
      </span>
      
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #ddd'
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#007bff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              {user.displayName || 'User'}
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#666'
            }}>
              {user.email}
            </div>
          </div>
          
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            style={{ 
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <path fill="#666" d="M7 10l5 5 5-5z"/>
          </svg>
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10
              }}
              onClick={() => setDropdownOpen(false)}
            />
            
            {/* Dropdown */}
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              zIndex: 20,
              marginTop: '0.5rem'
            }}>
              <div style={{ 
                padding: '1rem',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  {user.displayName || 'User'}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666'
                }}>
                  {user.email}
                </div>
              </div>
              
              <button
                onClick={() => {
                  onSignOut();
                  setDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#dc3545',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
