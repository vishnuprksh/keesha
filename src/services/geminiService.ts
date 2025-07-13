import { GoogleGenAI } from '@google/genai';
import { accountService } from '../firebaseService';

export interface GeminiTransactionData {
  title: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  date: string;
  description?: string;
}

export class GeminiService {
  private ai: GoogleGenAI;
  private model = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment variables.');
    }

    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async processPDFText(pdfText: string, userId: string, useThinkingMode: boolean = false): Promise<GeminiTransactionData[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch accounts');
    }
    
    // Check token size limits - Gemini models typically have ~30k token limits
    // Rough estimate: 1 token ≈ 4 characters for most text
    const estimatedTokens = Math.ceil(pdfText.length / 4);
    const maxTokens = 100000; // Conservative limit to leave room for response
    
    if (estimatedTokens > maxTokens) {
      throw new Error(`PDF text is too large (approximately ${estimatedTokens} tokens). Please use a smaller PDF or split it into sections. Maximum recommended size is about ${maxTokens} tokens (${maxTokens * 4} characters).`);
    }

    // For large texts (>10k tokens), process in chunks to avoid response limits
    const chunkThreshold = 10000; // tokens (~40k characters)
    if (estimatedTokens > chunkThreshold) {
      console.log(`Large document detected (${estimatedTokens} tokens). Processing in chunks...`);
      return await this.processLargeDocumentInChunks(pdfText, userId, useThinkingMode);
    }
    
    // Fetch accounts from database
    const accounts = await accountService.getAllAccounts(userId);
    const accountsList = accounts.map(acc => `${acc.name} (${acc.type})`).join(', ');
    
    // Log the accounts list for debugging
    console.log('Accounts list being sent to Gemini API:', accountsList);
    console.log('PDF text being processed:', pdfText.substring(0, 200) + '...');
    console.log(`Estimated tokens: ${estimatedTokens}`);
    console.log(`Thinking mode: ${useThinkingMode ? 'ENABLED (slower, more accurate)' : 'DISABLED (faster)'}`);
    
    const config = {
      temperature: 0,
      maxOutputTokens: 32768, // Increase output token limit for large responses
      thinkingConfig: {
        thinkingBudget: useThinkingMode ? -1 : 0,
      },
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are a transaction parser. Convert bank statement text into CSV format with intelligent account mapping.

CRITICAL CSV FORMAT REQUIREMENTS:
1. Return ONLY comma-separated values with EXACTLY 6 columns per row
2. NO headers, NO explanations, NO extra text
3. Each row must have: title,amount,fromAccount,toAccount,date,description
4. PROCESS ALL TRANSACTIONS - do not truncate or skip any transactions
5. If there are many transactions, ensure you process ALL of them, not just the first few

COLUMN SPECIFICATIONS:
- Column 1 (title): Brief transaction description (e.g., "UPI Payment", "Bank Transfer")  
- Column 2 (amount): Positive number only (e.g., 100.00, 250)
- Column 3 (fromAccount): Exact account name from available list
- Column 4 (toAccount): Exact account name from available list  
- Column 5 (date): YYYY-MM-DD format only (e.g., 2025-01-22)
- Column 6 (description): Optional details

ACCOUNT SELECTION RULES:
- Use ONLY accounts from the provided list with exact names including (type)
- For debits/payments: fromAccount = bank account, toAccount = expense/destination account
- For credits/deposits: fromAccount = source account, toAccount = bank account
- Intelligently match transaction descriptions to appropriate account types:
  * Food/grocery transactions → accounts with "food", "grocery", "dining" in name
  * Travel/transport → accounts with "travel", "transport", "fuel" in name
  * Utilities → accounts with "utility", "electric", "internet", "wifi" in name
  * Entertainment → accounts with "entertainment", "fun", "leisure" in name

EXAMPLE OUTPUT FORMAT:
UPI Payment,100.00,SIB (bank),Food (expense),2025-05-01,Restaurant payment
Bank Transfer,2000.00,SIB (bank),Ajith (transaction),2025-05-02,Personal transfer
UPI Receipt,105.00,External (transaction),SIB (bank),2025-05-02,Money received

AVAILABLE ACCOUNTS (use these EXACT names):
${accountsList}

IMPORTANT: 
- Return ONLY the CSV data rows, no headers, no extra text
- PROCESS ALL TRANSACTIONS in the input text
- Do not truncate or limit the number of transactions
- Each transaction should be on its own line`,
        }
      ],
    };

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: pdfText,
          },
        ],
      },
    ];

    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let csvText = '';
      for await (const chunk of response) {
        csvText += chunk.text;
      }

      // Log the raw CSV response for debugging
      console.log('Raw CSV response length:', csvText.length);
      console.log('Raw CSV response (first 1000 chars):', csvText.substring(0, 1000) + '...');
      console.log('Raw CSV response (last 500 chars):', csvText.slice(-500));

      // Count lines in response
      const responseLines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
      console.log(`CSV response contains ${responseLines.length} lines`);

      // Parse the CSV response
      const parsedTransactions = this.parseCSVResponse(csvText);
      
      // Log parsed transactions with account selections
      console.log(`Successfully parsed ${parsedTransactions.length} transactions from ${responseLines.length} CSV lines`);
      console.log('Sample parsed transactions:', parsedTransactions.slice(0, 3).map(t => ({
        title: t.title,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        amount: t.amount
      })));
      
      return parsedTransactions;
    } catch (error) {
      console.error('Error processing PDF text with Gemini:', error);
      throw new Error('Failed to process PDF text. Please try again.');
    }
  }

  private parseCSVResponse(csvText: string): GeminiTransactionData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 1) {
      throw new Error('Invalid CSV response from Gemini');
    }

    // Skip any header line if it exists
    let dataLines = lines;
    if (lines[0] && (lines[0].toLowerCase().includes('title') || lines[0].toLowerCase().includes('amount'))) {
      dataLines = lines.slice(1);
    }
    
    const transactions: GeminiTransactionData[] = [];

    for (const line of dataLines) {
      if (line.trim() === '') continue;
      
      try {
        // Parse CSV line (handle quoted fields)
        const fields = this.parseCSVLine(line);
        
        if (fields.length >= 5) {
          // Handle malformed CSV where fields might be in wrong order
          let title = fields[0]?.trim() || 'Unknown Transaction';
          let amount = parseFloat(fields[1]) || 0;
          let fromAccount = fields[2]?.trim() || '';
          let toAccount = fields[3]?.trim() || '';
          let date = fields[4]?.trim() || '';
          let description = fields[5]?.trim() || '';
          
          // If amount is negative, take absolute value
          amount = Math.abs(amount);
          
          // Clean and validate date - if it doesn't look like a date, try to extract or default
          if (date && !this.isValidDateFormat(date)) {
            // Try to find a date pattern in the description or other fields
            const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
            let foundDate = '';
            
            // Check all fields for a valid date
            for (const field of fields) {
              const match = field.match(datePattern);
              if (match) {
                foundDate = match[1];
                break;
              }
            }
            
            if (foundDate) {
              date = foundDate;
            } else {
              // Default to today's date if no valid date found
              date = new Date().toISOString().split('T')[0];
              console.warn('No valid date found, using current date:', date);
            }
          }
          
          // Convert date format
          if (date) {
            date = this.convertDateFormat(date);
          }
          
          // Validate and clean accounts
          if (!fromAccount) fromAccount = 'Unknown (transaction)';
          if (!toAccount) toAccount = 'Unknown (transaction)';
          
          transactions.push({
            title: title,
            amount: amount,
            fromAccount: fromAccount,
            toAccount: toAccount,
            date: date,
            description: description
          });
        }
      } catch (error) {
        console.warn('Error parsing CSV line:', line, error);
      }
    }

    return transactions;
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    fields.push(current.trim());
    return fields;
  }

  private convertDateFormat(dateStr: string): string {
    // Handle various date formats and convert to YYYY-MM-DD
    const trimmed = dateStr.trim();
    
    // Pattern: DD-MM-YY or DD/MM/YY
    const shortYearPattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/;
    const shortMatch = trimmed.match(shortYearPattern);
    
    if (shortMatch) {
      const day = shortMatch[1].padStart(2, '0');
      const month = shortMatch[2].padStart(2, '0');
      let year = shortMatch[3];
      
      // Convert 2-digit year to 4-digit (assuming 20xx for years 00-99)
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum <= 50 ? `20${year}` : `19${year}`;
      }
      
      return `${year}-${month}-${day}`;
    }
    
    // Pattern: DD-MM-YYYY or DD/MM/YYYY
    const fullYearPattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
    const fullMatch = trimmed.match(fullYearPattern);
    
    if (fullMatch) {
      const day = fullMatch[1].padStart(2, '0');
      const month = fullMatch[2].padStart(2, '0');
      const year = fullMatch[3];
      
      return `${year}-${month}-${day}`;
    }
    
    // If already in YYYY-MM-DD format, return as is
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoPattern.test(trimmed)) {
      return trimmed;
    }
    
    // Fallback: return original string
    console.warn('Unable to parse date format:', dateStr);
    return dateStr;
  }

  private isValidDateFormat(dateStr: string): boolean {
    // Check if the string matches common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,                    // YYYY-MM-DD
      /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/      // DD/MM/YY or DD-MM-YYYY etc.
    ];
    
    // If it doesn't match basic date patterns, it's invalid
    if (!datePatterns.some(pattern => pattern.test(dateStr.trim()))) {
      return false;
    }
    
    // Try to parse as date
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  private async processLargeDocumentInChunks(pdfText: string, userId: string, useThinkingMode: boolean = false): Promise<GeminiTransactionData[]> {
    // Split text into chunks based on estimated transaction count
    const chunks = this.splitTextIntoChunks(pdfText, 10000); // ~10k tokens per chunk
    const allTransactions: GeminiTransactionData[] = [];
    
    console.log(`Processing ${chunks.length} chunks...`);
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
      
      try {
        // Add a small delay between chunks to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const chunkTransactions = await this.processSingleChunk(chunks[i], userId, useThinkingMode);
        allTransactions.push(...chunkTransactions);
        
        console.log(`Chunk ${i + 1} processed: ${chunkTransactions.length} transactions`);
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        // Continue with other chunks even if one fails
      }
    }
    
    console.log(`Total transactions processed: ${allTransactions.length}`);
    return allTransactions;
  }

  private splitTextIntoChunks(text: string, maxTokensPerChunk: number): string[] {
    const lines = text.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    
    for (const line of lines) {
      const lineTokens = Math.ceil(line.length / 4);
      
      // If adding this line would exceed the limit, start a new chunk
      if (currentTokens + lineTokens > maxTokensPerChunk && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = line;
        currentTokens = lineTokens;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
        currentTokens += lineTokens;
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  private async processSingleChunk(chunkText: string, userId: string, useThinkingMode: boolean = false): Promise<GeminiTransactionData[]> {
    // Fetch accounts from database
    const accounts = await accountService.getAllAccounts(userId);
    const accountsList = accounts.map(acc => `${acc.name} (${acc.type})`).join(', ');
    
    const config = {
      temperature: 0,
      maxOutputTokens: 32768, // Increase output token limit for large responses
      thinkingConfig: {
        thinkingBudget: useThinkingMode ? -1 : 0,
      },
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are a transaction parser. Convert bank statement text into CSV format with intelligent account mapping.

CRITICAL CSV FORMAT REQUIREMENTS:
1. Return ONLY comma-separated values with EXACTLY 6 columns per row
2. NO headers, NO explanations, NO extra text
3. Each row must have: title,amount,fromAccount,toAccount,date,description
4. PROCESS ALL TRANSACTIONS - do not truncate or skip any transactions
5. If there are many transactions, ensure you process ALL of them, not just the first few

COLUMN SPECIFICATIONS:
- Column 1 (title): Brief transaction description (e.g., "UPI Payment", "Bank Transfer")  
- Column 2 (amount): Positive number only (e.g., 100.00, 250)
- Column 3 (fromAccount): Exact account name from available list
- Column 4 (toAccount): Exact account name from available list  
- Column 5 (date): YYYY-MM-DD format only (e.g., 2025-01-22)
- Column 6 (description): Optional details

ACCOUNT SELECTION RULES:
- Use ONLY accounts from the provided list with exact names including (type)
- For debits/payments: fromAccount = bank account, toAccount = expense/destination account
- For credits/deposits: fromAccount = source account, toAccount = bank account
- Intelligently match transaction descriptions to appropriate account types:
  * Food/grocery transactions → accounts with "food", "grocery", "dining" in name
  * Travel/transport → accounts with "travel", "transport", "fuel" in name
  * Utilities → accounts with "utility", "electric", "internet", "wifi" in name
  * Entertainment → accounts with "entertainment", "fun", "leisure" in name

EXAMPLE OUTPUT FORMAT:
UPI Payment,100.00,SIB (bank),Food (expense),2025-05-01,Restaurant payment
Bank Transfer,2000.00,SIB (bank),Ajith (transaction),2025-05-02,Personal transfer
UPI Receipt,105.00,External (transaction),SIB (bank),2025-05-02,Money received

AVAILABLE ACCOUNTS (use these EXACT names):
${accountsList}

IMPORTANT: 
- Return ONLY the CSV data rows, no headers, no extra text
- PROCESS ALL TRANSACTIONS in the input text
- Do not truncate or limit the number of transactions
- Each transaction should be on its own line`,
        }
      ],
    };

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: chunkText,
          },
        ],
      },
    ];

    try {
      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let csvText = '';
      for await (const chunk of response) {
        csvText += chunk.text;
      }

      // Log the raw CSV response for debugging
      console.log('Raw CSV response length:', csvText.length);
      console.log('Raw CSV response (first 500 chars):', csvText.substring(0, 500) + '...');

      // Parse the CSV response
      const parsedTransactions = this.parseCSVResponse(csvText);
      
      return parsedTransactions;
    } catch (error) {
      console.error('Error processing chunk with Gemini:', error);
      throw new Error('Failed to process text chunk. Please try again.');
    }
  }
}
