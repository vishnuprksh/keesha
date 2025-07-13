import React, { useState } from 'react';
import { Account, DEFAULT_ACCOUNTS } from '../types';

interface SelectableAccount extends Omit<Account, 'id'> {
  selected: boolean;
}

interface OnboardingWizardProps {
  onComplete: (selectedAccounts: Omit<Account, 'id'>[]) => void;
  onSkip: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectableAccount[]>(
    DEFAULT_ACCOUNTS.map(account => ({ ...account, selected: true }))
  );
  const [customAccounts, setCustomAccounts] = useState<SelectableAccount[]>([]);

  const totalSteps = 3;

  const handleAccountToggle = (index: number, isCustom: boolean = false) => {
    if (isCustom) {
      setCustomAccounts(prev => 
        prev.map((account, i) => 
          i === index ? { ...account, selected: !account.selected } : account
        )
      );
    } else {
      setSelectedAccounts(prev => 
        prev.map((account, i) => 
          i === index ? { ...account, selected: !account.selected } : account
        )
      );
    }
  };

  const addCustomAccount = () => {
    const newAccount: SelectableAccount = {
      name: '',
      type: 'bank' as const,
      balance: 0,
      description: '',
      selected: true
    };
    setCustomAccounts(prev => [...prev, newAccount]);
  };

  const updateCustomAccount = (index: number, field: string, value: any) => {
    setCustomAccounts(prev => 
      prev.map((account, i) => 
        i === index ? { ...account, [field]: value } : account
      )
    );
  };

  const removeCustomAccount = (index: number) => {
    setCustomAccounts(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const allSelected = [
      ...selectedAccounts.filter(acc => acc.selected).map(({ selected, ...acc }) => acc),
      ...customAccounts.filter(acc => acc.selected && acc.name.trim()).map(({ selected, ...acc }) => acc)
    ];
    onComplete(allSelected);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>Welcome to Keesha! 🎉</h2>
            <div className="welcome-content">
              <p>Let's set up your personal finance manager in just a few steps.</p>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon">💳</div>
                  <h3>Track Accounts</h3>
                  <p>Manage multiple bank accounts, income, and expense categories</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <h3>Monitor Transactions</h3>
                  <p>Record and categorize all your financial transactions</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📈</div>
                  <h3>View Analytics</h3>
                  <p>Get insights into your spending patterns and financial health</p>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📁</div>
                  <h3>Import Data</h3>
                  <p>Easily import transactions from CSV files or banks</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>Choose Your Accounts</h2>
            <p>Select the accounts you'd like to start with. You can always add more later.</p>
            
            <div className="accounts-selection">
              <h3>Recommended Accounts</h3>
              <div className="accounts-grid">
                {selectedAccounts.map((account, index) => (
                  <div 
                    key={index}
                    className={`account-card ${account.selected ? 'selected' : ''}`}
                    onClick={() => handleAccountToggle(index)}
                  >
                    <div className="account-info">
                      <h4>{account.name}</h4>
                      <p className="account-type">{account.type}</p>
                      <p className="account-description">{account.description}</p>
                    </div>
                    <div className="account-checkbox">
                      <input
                        type="checkbox"
                        checked={account.selected}
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="custom-accounts-section">
                <div className="section-header">
                  <h3>Custom Accounts</h3>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={addCustomAccount}
                  >
                    + Add Custom Account
                  </button>
                </div>
                
                {customAccounts.map((account, index) => (
                  <div key={index} className="custom-account-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Account name"
                        value={account.name}
                        onChange={(e) => updateCustomAccount(index, 'name', e.target.value)}
                      />
                      <select
                        value={account.type}
                        onChange={(e) => updateCustomAccount(index, 'type', e.target.value)}
                      >
                        <option value="bank">Bank</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Initial balance"
                        value={account.balance}
                        onChange={(e) => updateCustomAccount(index, 'balance', parseFloat(e.target.value) || 0)}
                      />
                      <div className="account-actions">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={account.selected}
                            onChange={() => handleAccountToggle(index, true)}
                          />
                          Include
                        </label>
                        <button
                          type="button"
                          className="btn-danger-small"
                          onClick={() => removeCustomAccount(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={account.description}
                      onChange={(e) => updateCustomAccount(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        const allSelectedAccounts = [
          ...selectedAccounts.filter(acc => acc.selected),
          ...customAccounts.filter(acc => acc.selected && acc.name.trim())
        ];

        return (
          <div className="onboarding-step">
            <h2>Review Your Setup</h2>
            <p>You're all set! Here's what we'll create for you:</p>
            
            <div className="setup-summary">
              <h3>Accounts to create ({allSelectedAccounts.length})</h3>
              <div className="accounts-preview">
                {allSelectedAccounts.map((account, index) => (
                  <div key={index} className="account-preview-card">
                    <div className="account-info">
                      <h4>{account.name}</h4>
                      <span className="account-type-badge">{account.type}</span>
                      {account.balance !== 0 && (
                        <span className="account-balance">
                          Initial balance: ${account.balance.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {account.description && (
                      <p className="account-description">{account.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="next-steps">
              <h3>What's next?</h3>
              <ul>
                <li>Start adding transactions to track your finances</li>
                <li>Import existing data from CSV files</li>
                <li>Explore the analytics dashboard</li>
                <li>Set up additional accounts as needed</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-wizard">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="step-indicator">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <div className="onboarding-content">
          {renderStepContent()}
        </div>

        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button 
              className="btn-secondary"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Back
            </button>
          )}
          
          <div className="actions-right">
            <button 
              className="btn-text"
              onClick={onSkip}
            >
              Skip Setup
            </button>
            
            {currentStep < totalSteps ? (
              <button 
                className="btn-primary"
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleComplete}
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
