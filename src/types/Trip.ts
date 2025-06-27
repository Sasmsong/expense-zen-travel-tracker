
export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
  destination?: string;
  totalAmount: number;
  expenseCount: number;
  createdAt: string;
  budget?: number;
  currency?: string;
}
