import { GoogleGenAI } from '@google/genai';
import { Account } from '../types';

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
  private model = 'gemini-2.5-pro';

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment variables.');
    }

    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async processPDFText(pdfText: string, accounts: Account[]): Promise<GeminiTransactionData[]> {
    const accountsList = accounts.map(acc => `${acc.name} (${acc.type})`).join(', ');
    
    const config = {
      temperature: 0,
      thinkingConfig: {
        thinkingBudget: -1,
      },
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `return STRICTLY in csv format

convert the text given into the following format

title: Name/description of the transaction (required)
amount: Positive number (required)
fromAccount: Source account name or ID (required)
toAccount: Destination account name or ID (required)
date: Date in YYYY-MM-DD format (required)
description: Additional details (optional)
Available accounts: ${accountsList}`,
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

      // Parse the CSV response
      return this.parseCSVResponse(csvText);
    } catch (error) {
      console.error('Error processing PDF text with Gemini:', error);
      throw new Error('Failed to process PDF text. Please try again.');
    }
  }

  private parseCSVResponse(csvText: string): GeminiTransactionData[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Invalid CSV response from Gemini');
    }

    // Skip header line
    const dataLines = lines.slice(1);
    const transactions: GeminiTransactionData[] = [];

    for (const line of dataLines) {
      if (line.trim() === '') continue;
      
      try {
        // Parse CSV line (handle quoted fields)
        const fields = this.parseCSVLine(line);
        
        if (fields.length >= 5) {
          transactions.push({
            title: fields[0] || '',
            amount: parseFloat(fields[1]) || 0,
            fromAccount: fields[2] || '',
            toAccount: fields[3] || '',
            date: fields[4] || '',
            description: fields[5] || ''
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
}
