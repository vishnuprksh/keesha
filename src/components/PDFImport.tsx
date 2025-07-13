import React, { useState } from 'react';
import { Account, CSVRow } from '../types';
import { GeminiService, GeminiTransactionData } from '../services/geminiService';
import { validateCSVTransaction } from '../utils/validation';

interface PDFImportProps {
  accounts: Account[];
  onImportData: (data: CSVRow[]) => void;
  onClose: () => void;
  userId: string;
}

const PDFImport: React.FC<PDFImportProps> = ({ accounts, onImportData, onClose, userId }) => {
  const [pdfText, setPdfText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState(false);

  const geminiService = new GeminiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfText.trim()) {
      setError('Please paste the PDF text first');
      return;
    }

    if (!userId) {
      setError('User not authenticated. Please sign in first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const geminiData = await geminiService.processPDFText(pdfText, userId, useThinkingMode);
      
      // Convert Gemini data to CSVRow format
      const csvData: CSVRow[] = geminiData.map((data: GeminiTransactionData) => {
        const validation = validateCSVTransaction(data, accounts);
        
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: data.title,
          amount: data.amount.toString(),
          fromAccountId: validation.fromAccountId || '',
          toAccountId: validation.toAccountId || '',
          date: data.date,
          description: data.description || '',
          isImportant: 'false',
          isValid: validation.isValid,
          errors: validation.errors,
          selected: validation.isValid // Auto-select valid rows
        };
      });

      onImportData(csvData);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF text';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pdf-import-overlay">
      <div className="pdf-import-modal">
        <div className="pdf-import-header">
          <h3>📄 Import from PDF</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="pdf-import-body">
            <div className="instruction-text">
              <p>Paste the text content from your PDF bank statement or financial document below. The AI will automatically extract and format the transaction data.</p>
            </div>
            
            <div className="textarea-container">
              <textarea
                value={pdfText}
                onChange={(e) => setPdfText(e.target.value)}
                placeholder="Paste your PDF text here..."
                className="pdf-text-input"
                rows={15}
                disabled={isProcessing}
              />
            </div>
            
            {error && (
              <div className={`error-message ${error.includes('too large') ? 'token-limit-warning' : ''}`}>
                {error.includes('too large') ? (
                  <>
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                      <strong>PDF Text Too Large</strong>
                      <p>{error}</p>
                      <p className="warning-suggestion">
                        <strong>Suggestions:</strong>
                        <br />• Copy only a portion of the PDF text (e.g., one month of transactions)
                        <br />• Split large PDFs into smaller sections
                        <br />• Remove unnecessary text like headers, footers, or account summaries
                      </p>
                    </div>
                  </>
                ) : (
                  <>❌ {error}</>
                )}
              </div>
            )}
            
            <div className="thinking-mode-toggle">
              <label className="toggle-container">
                <input
                  type="checkbox"
                  checked={useThinkingMode}
                  onChange={(e) => setUseThinkingMode(e.target.checked)}
                  disabled={isProcessing}
                />
                <span className="toggle-checkmark"></span>
                <span className="toggle-label">Think Harder 🧠</span>
                <span className="toggle-description">
                  Uses AI reasoning for better accuracy (slower processing)
                </span>
              </label>
            </div>
            
            <div className="available-accounts">
              <h4>Available Accounts:</h4>
              <div className="accounts-list">
                {accounts.map(account => (
                  <span key={account.id} className={`account-tag ${account.type}`}>
                    {account.name} ({account.type})
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pdf-import-footer">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-btn"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="process-btn"
              disabled={!pdfText.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="loading-bar">
                    <div className="loading-bar-progress"></div>
                  </div>
                  Processing... (may take a few minutes)
                </>
              ) : (
                'Process with AI'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFImport;
