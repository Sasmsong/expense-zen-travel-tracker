import Tesseract from 'tesseract.js';

export interface ParsedInvoice {
  total?: number;
  category?: string;
  date?: string;
  merchant?: string;
  rawText?: string; // OCR raw text for debugging/fallback UI
}

export const parseInvoiceImage = async (imageFile: string): Promise<ParsedInvoice> => {
  try {
    console.log('🔍 Starting OCR processing...');
    console.log('📄 Image data preview:', imageFile.substring(0, 100) + '...');

    // Preprocess image to improve OCR success
    const processed = await preprocessImage(imageFile);

    // Initialize Tesseract with better settings and explicit CDN paths
    const { data: { text } } = await Tesseract.recognize(processed, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`📝 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      workerPath: 'https://unpkg.com/tesseract.js@6.0.1/dist/worker.min.js',
      corePath: 'https://unpkg.com/tesseract.js-core@6.0.0/tesseract-core.wasm.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      tessedit_pageseg_mode: 6,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    } as any);

    console.log('✅ OCR Complete! Extracted text:');
    console.log('---START OCR TEXT---');
    console.log(text);
    console.log('---END OCR TEXT---');

    const parsed = parseInvoiceText(text);
    console.log('🎯 Parsed invoice data:', parsed);

    // If nothing parsed but text exists, try a second pass with a different PSM
    if ((!parsed.total && !parsed.merchant && !parsed.date && !parsed.category) && text.trim().length > 0) {
      console.log('🔁 Second pass OCR with different PSM...');
      const { data: { text: text2 } } = await Tesseract.recognize(processed, 'eng', {
        tessedit_pageseg_mode: 4,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
      } as any);
      const parsed2 = parseInvoiceText(text2);
      if (parsed2.total || parsed2.merchant || parsed2.date || parsed2.category) {
        return { ...parsed2, rawText: text2 };
      }
    }

    return { ...parsed, rawText: text };
  } catch (error) {
    console.error('❌ OCR Error:', error);
    return {};
  }
};

// Image pre-processing helper
function preprocessImage(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const MAX_SIDE = 1600;
      const scale = Math.min(MAX_SIDE / Math.max(img.width, img.height), 2);
      const w = Math.round(img.width * (scale < 1 ? 1 : scale));
      const h = Math.round(img.height * (scale < 1 ? 1 : scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageDataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const contrast = 1.2; // 20% boost
      const intercept = 128 * (1 - contrast);
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        let y = 0.299 * r + 0.587 * g + 0.114 * b; // grayscale
        y = contrast * y + intercept; // contrast
        y = Math.max(0, Math.min(255, y));
        data[i] = data[i + 1] = data[i + 2] = y;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

const parseInvoiceText = (text: string): ParsedInvoice => {
  const result: ParsedInvoice = {};
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  console.log('🔎 Processing lines:', lines);
  
  // 1. Extract Merchant Name (first meaningful line)
  result.merchant = extractMerchant(lines, text);
  
  // 2. Extract Total Amount 
  result.total = extractTotal(lines, text);
  
  // 3. Extract Date
  result.date = extractDate(text);
  
  // 4. Extract Category
  result.category = extractCategory(text, result.merchant);
  
  return result;
};

const extractMerchant = (lines: string[], text: string): string | undefined => {
  console.log('🏪 Extracting merchant...');
  
  // Look for merchant in the first few lines
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    
    // Skip obvious non-merchant patterns
    if (
      /^(receipt|invoice|bill|tax|date|time|order|table|server|thank|visit|www\.|http)/i.test(line) ||
      /^\d+[\s,.-]*\d*$/.test(line) || // Pure numbers
      /^[+\-\s\d()]+$/.test(line) || // Phone numbers
      /address:|tel\.|phone:|email:/i.test(line) || // Address/contact info
      line.length < 2 || line.length > 60
    ) {
      continue;
    }
    
    // Clean up the line
    const cleaned = line
      .replace(/[*#@\-=_]+/g, '') // Remove decorative chars
      .replace(/\s{2,}/g, ' ') // Multiple spaces to single
      .trim();
    
    if (cleaned.length >= 2 && /[A-Za-z]/.test(cleaned)) {
      console.log(`✅ Found merchant: "${cleaned}"`);
      return cleaned;
    }
  }
  
  console.log('❌ No merchant found');
  return undefined;
};

const extractTotal = (lines: string[], text: string): number | undefined => {
  console.log('💰 Extracting total amount...');
  
  // Look for total keywords with priority
  const totalKeywords = [
    'amount', 'total', 'grand total', 'total due', 'amount due', 
    'balance due', 'invoice total', 'final total'
  ];
  
  // Create a comprehensive amount regex
  const amountRegex = /\$?\s*([0-9]{1,6}(?:[.,][0-9]{2,3})*(?:\.[0-9]{2})?)/g;
  
  // First, try to find amounts near total keywords
  for (const keyword of totalKeywords) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (line.includes(keyword)) {
        console.log(`🎯 Found total keyword "${keyword}" in line: "${lines[i]}"`);
        
        // Check current line and next line for amounts
        const searchLines = [lines[i], lines[i + 1]].filter(Boolean);
        
        for (const searchLine of searchLines) {
          const matches = [...searchLine.matchAll(amountRegex)];
          if (matches.length > 0) {
            // Take the last/rightmost amount on the line
            const amountStr = matches[matches.length - 1][1];
            const amount = parseAmount(amountStr);
            if (amount && amount > 0) {
              console.log(`✅ Found total: $${amount}`);
              return amount;
            }
          }
        }
      }
    }
  }
  
  // Fallback: find the largest reasonable amount in the text
  const allAmounts = [...text.matchAll(amountRegex)]
    .map(m => parseAmount(m[1]))
    .filter((amount): amount is number => amount !== null && amount > 0 && amount < 10000);
  
  if (allAmounts.length > 0) {
    const maxAmount = Math.max(...allAmounts);
    console.log(`💡 Using largest amount as fallback: $${maxAmount}`);
    return maxAmount;
  }
  
  console.log('❌ No total amount found');
  return undefined;
};

const parseAmount = (amountStr: string): number | null => {
  // Remove currency symbols and clean up
  let cleaned = amountStr
    .replace(/[$€£¥₹]/g, '')
    .replace(/\s/g, '')
    .trim();
  
  // Handle different decimal separators
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Determine which is the decimal separator
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    
    if (lastDot > lastComma) {
      // Dot is decimal separator: 1,234.56
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // Comma is decimal separator: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    // Only comma - check if it's decimal or thousands separator
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      // Likely decimal: 12,34
      cleaned = cleaned.replace(',', '.');
    } else {
      // Likely thousands: 1,234
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const number = parseFloat(cleaned);
  return isNaN(number) ? null : number;
};

const extractDate = (text: string): string | undefined => {
  console.log('📅 Extracting date...');
  
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g, // YYYY/MM/DD
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/gi, // Month DD, YYYY
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/gi // DD Month YYYY
  ];
  
  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      try {
        let date: Date;
        
        if (pattern.source.includes('jan|feb')) {
          // Handle month name patterns
          const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          const monthStr = (match[1] || match[2]).toLowerCase();
          const monthIndex = monthNames.findIndex(m => monthStr.startsWith(m));
          
          if (monthIndex !== -1) {
            const day = parseInt(match[2] || match[1]);
            const year = parseInt(match[3]);
            date = new Date(year < 100 ? year + 2000 : year, monthIndex, day);
          } else {
            continue;
          }
        } else {
          // Handle numeric patterns
          const parts = [match[1], match[2], match[3]].map(p => parseInt(p));
          let [a, b, c] = parts;
          
          // Year normalization
          if (c < 100) c += 2000;
          
          // Determine if it's MM/DD/YYYY or DD/MM/YYYY
          if (a > 12) {
            // Must be DD/MM/YYYY
            date = new Date(c, b - 1, a);
          } else if (b > 12) {
            // Must be MM/DD/YYYY
            date = new Date(c, a - 1, b);
          } else {
            // Ambiguous - assume MM/DD/YYYY (US format)
            date = new Date(c, a - 1, b);
          }
        }
        
        if (!isNaN(date.getTime())) {
          const dateStr = date.toISOString().split('T')[0];
          console.log(`✅ Found date: ${dateStr}`);
          return dateStr;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  console.log('❌ No date found');
  return undefined;
};

const extractCategory = (text: string, merchant?: string): string | undefined => {
  console.log('🏷️ Extracting category...');
  
  const categories = {
    'Coffee': [
      'coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'macchiato', 'mocha',
      'starbucks', 'dunkin', 'tim hortons', 'peet', 'caribou', 'coffee shop',
      'coffeehouse', 'roasters', 'beans'
    ],
    'Food': [
      'restaurant', 'pizza', 'burger', 'food', 'kitchen', 'diner', 'bistro', 
      'grill', 'bar', 'bakery', 'sushi', 'taco', 'bbq', 'grocery', 'market',
      'walmart', 'target', 'costco', 'panera', 'chipotle', 'mcdonald', 'kfc'
    ],
    'Hotel': [
      'hotel', 'inn', 'resort', 'lodge', 'motel', 'accommodation', 'stay',
      'marriott', 'hilton', 'hyatt', 'holiday inn'
    ],
    'Transportation': [
      'taxi', 'uber', 'lyft', 'bus', 'train', 'metro', 'transport', 'parking',
      'gas', 'fuel', 'shell', 'bp', 'chevron', 'exxon'
    ],
    'Entertainment': [
      'movie', 'theater', 'cinema', 'show', 'concert', 'museum', 'park'
    ],
    'Flights': [
      'airline', 'airways', 'flight', 'airport', 'boarding'
    ]
  };
  
  const searchText = (text + ' ' + (merchant || '')).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      console.log(`✅ Found category: ${category}`);
      return category;
    }
  }
  
  console.log('❌ No category found');
  return undefined;
};