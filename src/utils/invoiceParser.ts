
import { createWorker } from 'tesseract.js';

export interface ParsedInvoice {
  total?: number;
  category?: string;
  date?: string;
  merchant?: string;
}

export const parseInvoiceImage = async (imageFile: string): Promise<ParsedInvoice> => {
  try {
    console.log('Starting OCR processing...', imageFile.substring(0, 50) + '...');
    
    const worker = await createWorker('eng', 1, {
      logger: (m) => console.log('Tesseract:', m)
    });
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
  
  // Extract merchant name (usually first meaningful line at top of receipt)
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Look for merchant in first few lines (before address/date typically)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip common non-merchant patterns
    if (/^(receipt|invoice|bill|tax|date|time|order|table|server)/i.test(line)) continue;
    if (/^\d+[\s,.-]*\d*$/.test(line)) continue; // Skip pure numbers
    if (line.length < 3 || line.length > 50) continue; // Reasonable merchant name length
    
    // Clean up the merchant name
    let merchantName = line
      .replace(/[*#@]+/g, '') // Remove special chars
      .trim();
    
    // If it looks like a real merchant name
    if (merchantName.length >= 3) {
      result.merchant = merchantName;
      break;
    }
  }
  
  // Extract total amount (robust, line-aware)
  // Reuse lines array from merchant extraction

  const parseAmountStr = (raw: string): number | null => {
    let a = raw.trim().replace(/[^0-9.,\s$€£]/g, '');
    // Remove currency symbols and spaces around
    a = a.replace(/[$€£\s]/g, '');
    const hasComma = a.includes(',');
    const hasDot = a.includes('.');
    let normalized = a;
    if (hasComma && hasDot) {
      if (a.lastIndexOf(',') > a.lastIndexOf('.')) {
        // 1.234,56 => 1234.56
        normalized = a.replace(/\./g, '').replace(',', '.');
      } else {
        // 1,234.56 => 1234.56
        normalized = a.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      const parts = a.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        normalized = parts[0].replace(/[^0-9]/g, '') + '.' + parts[1];
      } else {
        normalized = a.replace(/,/g, '');
      }
    } else {
      // remove thousand commas if any remain
      normalized = a.replace(/,(?=\d{3}\b)/g, '');
    }
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  };

  const amountRegex = /(?:USD|EUR|GBP|CAD|AUD|INR|JPY|CHF|CNY|RMB)?\s*[$€£]?\s*([0-9]{1,3}(?:[.,\s][0-9]{3})*(?:[.,][0-9]{2})|[0-9]+(?:[.,][0-9]{2}))/g;
  const keywordPriority = ['grand total','total due','amount due','balance due','invoice total','total amount','total'];

  outer: for (const kw of keywordPriority) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (!lower.includes(kw)) continue;

      // Try amounts on the same line first
      const sameLineMatches = [...line.matchAll(amountRegex)];
      if (sameLineMatches.length) {
        const last = sameLineMatches[sameLineMatches.length - 1][1];
        const val = parseAmountStr(last);
        if (val && val > 0) { result.total = val; break outer; }
      }

      // Then try the next line (common in printed receipts)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextMatches = [...nextLine.matchAll(amountRegex)];
        if (nextMatches.length) {
          const last = nextMatches[nextMatches.length - 1][1];
          const val = parseAmountStr(last);
          if (val && val > 0) { result.total = val; break outer; }
        }
      }
    }
  }

  // Fallback: take the maximum amount found in the entire text
  if (result.total == null) {
    const allMatches = [...text.matchAll(amountRegex)]
      .map(m => parseAmountStr(m[1]))
      .filter((n): n is number => typeof n === 'number' && !isNaN(n));
    if (allMatches.length) {
      const max = Math.max(...allMatches);
      if (max > 0) result.total = max;
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
            date = new Date(year < 100 ? year + 2000 : year, monthIndex, day);
          } else {
            continue;
          }
        } else {
          // Handle numeric date patterns
          const parts = [match[1], match[2], match[3]].map(p => parseInt(p));
          let year = parts[2];
          if (year < 100) year += 2000; // 2-digit years to 20xx
          // Heuristic: if first part > 12, it is likely DD/MM/YYYY
          const monthFirst = parts[0] <= 12;
          const month = monthFirst ? parts[0] : parts[1];
          const day = monthFirst ? parts[1] : parts[0];
          date = new Date(year, month - 1, day);
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
    'Food': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'kitchen', 'diner', 'bistro', 'grill', 'bar', 'grocery', 'supermarket', 'market', 'deli', 'bakery', 'sushi', 'taco', 'bbq', 'walmart', 'target', 'costco', 'aldi', 'tesco', 'carrefour', 'kroger', 'whole foods', 'trader joe', "trader joe's", 'lidl', 'panera', 'chipotle', 'mcdonald', 'kfc', 'burger king', 'domino', 'pizza hut', 'subway', 'wendy', 'taco bell', 'five guys', 'panda express'],
    'Coffee': ['coffee', 'starbucks', 'espresso', 'latte', 'cappuccino', 'cafe', 'coffeehouse', 'dunkin', 'tim hortons', 'peet', 'caribou'],
    'Hotel': ['hotel', 'inn', 'resort', 'lodge', 'motel', 'accommodation', 'stay'],
    'Transportation': ['taxi', 'uber', 'lyft', 'bus', 'train', 'metro', 'transport', 'parking', 'gas', 'fuel', 'ride', 'cab', 'toll', 'petrol', 'diesel', 'shell', 'bp', 'esso', 'chevron', 'exxon', 'arco'],
    'Entertainment': ['movie', 'theater', 'cinema', 'show', 'concert', 'museum', 'park', 'entertainment'],
    'Flights': ['airline', 'airways', 'flight', 'airport', 'boarding', 'baggage', 'luggage', 'ticket', 'fare']
  };
  
  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.category = category;
      break;
    }
  }
  
  // Fallback merchant extraction if missing
  if (!result.merchant) {
    const isMeta = (l: string) => /^(receipt|invoice|bill|tax|date|time|order|table|server|thank|visit|subtotal|total|balance|amount|change|cash|card|visa|mastercard)/i.test(l);
    const isAddress = (l: string) => /(street|st\.|road|rd\.|ave\.|avenue|blvd\.|boulevard|suite|ste\.|floor|fl\.|zip|postcode|po box|city|state|country)/i.test(l) || /\d{2,}.*\d{2,}/.test(l);
    const isTooNumeric = (l: string) => (l.replace(/[^0-9]/g, '').length) > (l.replace(/[^A-Za-z]/g, '').length + 2);
    const top = (typeof lines !== 'undefined' && Array.isArray(lines) ? lines : text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)).slice(0, 12);
    const candidates = top.filter(l => l.length >= 3 && l.length <= 60 && /[A-Za-z]/.test(l) && !isMeta(l) && !isAddress(l) && !isTooNumeric(l));
    const brandMatch = (typeof lines !== 'undefined' && Array.isArray(lines) ? lines : top).find(l => /(inc\.?|llc\.?|ltd\.?|gmbh|s\.a\.|pty)/i.test(l));
    let chosen = candidates[0] || brandMatch;
    if (chosen) {
      let clean = chosen.replace(/[*#@]+/g, '').replace(/\s{2,}/g, ' ').trim();
      result.merchant = clean;
    }
  }
  
  return result;
};
