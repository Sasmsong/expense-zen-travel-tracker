
import { Expense } from "@/types/Expense";

export interface RecurringPattern {
  merchant: string;
  category: string;
  frequency: number;
  averageAmount: number;
  lastSeen: string;
}

export const analyzeRecurringExpenses = (expenses: Expense[]): RecurringPattern[] => {
  const merchantMap: { [key: string]: Expense[] } = {};
  
  // Group expenses by merchant
  expenses.forEach(expense => {
    const key = expense.merchant.toLowerCase().trim();
    if (!merchantMap[key]) {
      merchantMap[key] = [];
    }
    merchantMap[key].push(expense);
  });

  const patterns: RecurringPattern[] = [];

  Object.entries(merchantMap).forEach(([merchantKey, merchantExpenses]) => {
    if (merchantExpenses.length >= 2) { // Consider recurring if appears 2+ times
      const totalAmount = merchantExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const averageAmount = totalAmount / merchantExpenses.length;
      const lastExpense = merchantExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      patterns.push({
        merchant: lastExpense.merchant,
        category: lastExpense.category,
        frequency: merchantExpenses.length,
        averageAmount,
        lastSeen: lastExpense.date
      });
    }
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
};

export const isRecurringExpense = (merchant: string, allExpenses: Expense[]): boolean => {
  const patterns = analyzeRecurringExpenses(allExpenses);
  return patterns.some(pattern => 
    pattern.merchant.toLowerCase() === merchant.toLowerCase() && pattern.frequency >= 2
  );
};

export const getSuggestedCategory = (merchant: string, allExpenses: Expense[]): string | null => {
  const patterns = analyzeRecurringExpenses(allExpenses);
  const pattern = patterns.find(p => 
    p.merchant.toLowerCase() === merchant.toLowerCase()
  );
  return pattern?.category || null;
};
