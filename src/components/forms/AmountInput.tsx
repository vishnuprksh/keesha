import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  label,
  name,
  placeholder = '0.00',
  required = false,
  disabled = false,
  min = 0,
  max,
  step = 0.01
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Remove any non-numeric characters except decimal point
    newValue = newValue.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      newValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    onChange(newValue);
  };

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: '#dc3545' }}> *</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
          zIndex: 1,
          pointerEvents: 'none'
        }}>
          $
        </span>
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 1.5rem',
            border: '2px solid #e1e8ed',
            borderRadius: '10px',
            fontSize: '1rem',
            background: disabled ? '#f5f5f5' : 'white'
          }}
        />
      </div>
    </div>
  );
};

export default AmountInput;
