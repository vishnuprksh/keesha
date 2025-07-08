import React, { useState } from 'react';
import { Account, CSVRow } from '../types';
import { GeminiService, GeminiTransactionData } from '../services/geminiService';
import { validateCSVTransaction } from '../utils/validation';

interface PDFImportProps {
  accounts: Account[];
  onImportData: (data: CSVRow[]) => void;
  onClose: () => void;
}

const PDFImport: React.FC<PDFImportProps> = ({ accounts, onImportData, onClose }) => {
  const [pdfText, setPdfText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geminiService = new GeminiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfText.trim()) {
      setError('Please paste the PDF text first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const geminiData = await geminiService.processPDFText(pdfText, accounts);
      
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
      setError(err instanceof Error ? err.message : 'Failed to process PDF text');
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
              <div className="error-message">
                ❌ {error}
              </div>
            )}
            
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
              {isProcessing ? 'Processing...' : 'Process with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFImport;
