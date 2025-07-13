import React, { useState } from 'react';
import { AuthUser } from '../authService';

interface UserHeaderProps {
  user: AuthUser;
  onSignOut: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onSignOut }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="user-header">
      <span style={{ color: '#666', fontSize: '0.9rem' }}>
        Welcome back!
      </span>
      
      <div style={{ position: 'relative' }}>
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="user-dropdown-trigger"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '25px',
            padding: '8px 16px 8px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                objectFit: 'cover',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
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
              className="user-dropdown-backdrop"
              onClick={() => setDropdownOpen(false)}
            />
            
            {/* Dropdown */}
            <div 
              className="user-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`
              }}
            >
              <div className="user-dropdown-header">
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
                className="user-dropdown-item"
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
