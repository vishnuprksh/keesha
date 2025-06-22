import React, { useState, useEffect, useRef } from 'react';
import { Account, AccountType } from '../../types';

interface AccountSelectProps {
  accounts: Account[];
  value: string;
  onChange: (accountId: string) => void;
  placeholder?: string;
  filterType?: AccountType;
  excludeAccount?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  error?: boolean;
}

const AccountSelect: React.FC<AccountSelectProps> = ({
  accounts,
  value,
  onChange,
  placeholder = 'Select account',
  filterType,
  excludeAccount,
  required = false,
  disabled = false,
  label,
  name,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredAccounts = accounts.filter(account => {
    if (filterType && account.type !== filterType) return false;
    if (excludeAccount && account.id === excludeAccount) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        account.name.toLowerCase().includes(searchLower) ||
        account.type.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const selectedAccount = accounts.find(account => account.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 0);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredAccounts.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredAccounts.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredAccounts[highlightedIndex]) {
          handleAccountSelect(filteredAccounts[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 0);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case ' ':
        if (!isOpen && e.target === e.currentTarget) {
          e.preventDefault();
          setIsOpen(true);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 0);
        }
        break;
    }
  };

  const handleAccountSelect = (account: Account) => {
    onChange(account.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return '🏦';
      case 'income': return '📈';
      case 'expense': return '📉';
      case 'asset': return '💎';
      case 'liability': return '💳';
      case 'transaction': return '🔄';
      default: return '💰';
    }
  };

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: '#dc3545' }}> *</span>}
        </label>
      )}
      <div 
        className="searchable-select"
        ref={dropdownRef}
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          className="select-input"
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || placeholder}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `2px solid ${error ? '#dc3545' : '#e1e8ed'}`,
            borderRadius: '10px',
            fontSize: '1rem',
            background: disabled ? '#f5f5f5' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '50px',
            outline: 'none'
          }}
        >
          <span style={{ 
            color: selectedAccount ? '#333' : '#999',
            flex: 1
          }}>
            {selectedAccount 
              ? `${getAccountTypeIcon(selectedAccount.type)} ${selectedAccount.name} (${selectedAccount.type})`
              : placeholder
            }
          </span>
          <span style={{ 
            marginLeft: '8px',
            color: '#666',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div
            className="dropdown-menu"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '2px solid #e1e8ed',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ padding: '8px', position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '8px 30px 8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            
            {filteredAccounts.length === 0 ? (
              <div style={{ 
                padding: '12px', 
                textAlign: 'center', 
                color: '#999',
                fontStyle: 'italic'
              }}>
                No accounts found
              </div>
            ) : (
              filteredAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="dropdown-item"
                  onClick={() => handleAccountSelect(account)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: highlightedIndex === index ? '#f8f9fa' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span style={{ fontSize: '1.2em' }}>
                    {getAccountTypeIcon(account.type)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 500, color: '#333' }}>
                      {account.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.85em', 
                      color: '#666',
                      textTransform: 'capitalize'
                    }}>
                      {account.type}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSelect;
