
export interface CurrencyRate {
  code: string;
  rate: number;
  timestamp: number;
}

export const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export const getStoredBaseCurrency = (): string => {
  return localStorage.getItem('baseCurrency') || 'USD';
};

export const setBaseCurrency = (currency: string) => {
  localStorage.setItem('baseCurrency', currency);
};

export const getStoredExchangeRates = (): { [key: string]: CurrencyRate } => {
  const stored = localStorage.getItem('exchangeRates');
  return stored ? JSON.parse(stored) : {};
};

export const storeExchangeRate = (currency: string, rate: number) => {
  const rates = getStoredExchangeRates();
  rates[currency] = {
    code: currency,
    rate,
    timestamp: Date.now()
  };
  localStorage.setItem('exchangeRates', JSON.stringify(rates));
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, customRate?: number): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = getStoredExchangeRates();
  const rate = customRate || rates[fromCurrency]?.rate || 1;
  
  // Simple conversion logic - in a real app you'd use proper exchange rates
  const conversionRates: { [key: string]: number } = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110,
    'CAD': 1.25,
    'AUD': 1.35,
    'HKD': 7.8,
    'SGD': 1.35,
    'CNY': 6.45,
  };
  
  const baseAmount = amount / (conversionRates[fromCurrency] || 1);
  return baseAmount * (conversionRates[toCurrency] || 1);
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencyInfo = COMMON_CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || currency;
  return `${symbol}${amount.toFixed(2)}`;
};
