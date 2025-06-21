import React from 'react';
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
  name
}) => {
  const filteredAccounts = accounts.filter(account => {
    if (filterType && account.type !== filterType) return false;
    if (excludeAccount && account.id === excludeAccount) return false;
    return true;
  });

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: '#dc3545' }}> *</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px solid #e1e8ed',
          borderRadius: '10px',
          fontSize: '1rem',
          background: disabled ? '#f5f5f5' : 'white'
        }}
      >
        <option value="">{placeholder}</option>
        {filteredAccounts.map(account => (
          <option key={account.id} value={account.id}>
            {account.name} ({account.type})
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccountSelect;
