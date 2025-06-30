
import { createWorker } from 'tesseract.js';

export interface ParsedInvoice {
  total?: number;
  category?: string;
  date?: string;
}

export const parseInvoiceImage = async (imageFile: string): Promise<ParsedInvoice> => {
  try {
    console.log('Starting OCR processing...');
    
    const worker = await createWorker();
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    
    console.log('OCR Text:', text);
    
    return parseInvoiceText(text);
  } catch (error) {
    console.error('OCR Error:', error);
    return {};
  }
};

const parseInvoiceText = (text: string): ParsedInvoice => {
  const result: ParsedInvoice = {};
  
  // Extract total amount
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /\$(\d+\.\d{2})/g,
    /(\d+\.\d{2})\s*total/i,
    /grand total[:\s]*\$?(\d+\.?\d*)/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (amount > 0) {
        result.total = amount;
        break;
      }
    }
  }
  
  // Extract date
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/i,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let date: Date;
        if (pattern.source.includes('jan|feb')) {
          // Handle month name patterns
          const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const monthIndex = monthNames.findIndex(m => match[1].toLowerCase().startsWith(m) || match[2].toLowerCase().startsWith(m));
          if (monthIndex !== -1) {
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            date = new Date(year, monthIndex, day);
          } else {
            continue;
          }
        } else {
          // Handle numeric date patterns
          const parts = [match[1], match[2], match[3]].map(p => parseInt(p));
          // Assume MM/DD/YYYY or DD/MM/YYYY format
          if (parts[2] < 100) parts[2] += 2000; // Handle 2-digit years
          date = new Date(parts[2], parts[0] - 1, parts[1]); // Assuming MM/DD/YYYY
        }
        
        if (!isNaN(date.getTime())) {
          result.date = date.toISOString().split('T')[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // Extract category based on merchant keywords
  const categoryKeywords = {
    'Food': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'kitchen', 'diner', 'bistro', 'grill', 'bar'],
    'Coffee': ['coffee', 'starbucks', 'espresso', 'latte', 'cappuccino', 'cafe'],
    'Hotel': ['hotel', 'inn', 'resort', 'lodge', 'motel', 'accommodation', 'stay'],
    'Transportation': ['taxi', 'uber', 'lyft', 'bus', 'train', 'metro', 'transport', 'parking', 'gas', 'fuel'],
    'Entertainment': ['movie', 'theater', 'cinema', 'show', 'concert', 'museum', 'park', 'entertainment'],
    'Flights': ['airline', 'airways', 'flight', 'airport', 'boarding']
  };
  
  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.category = category;
      break;
    }
  }
  
  return result;
};
