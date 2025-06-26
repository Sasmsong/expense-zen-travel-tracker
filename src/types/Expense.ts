
export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  photo?: string | null;
  tags?: string[];
  currency?: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  isRecurring?: boolean;
}
