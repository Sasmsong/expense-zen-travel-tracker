
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react';
import { SpendingChart } from '@/components/SpendingChart';
import { Trip } from '@/types/Trip';
import { Expense } from '@/types/Expense';
import { formatCurrency } from '@/utils/currencyUtils';

interface AnalyticsDashboardProps {
  trips: Trip[];
  allExpenses: { [tripId: string]: Expense[] };
}

export const AnalyticsDashboard = ({ trips, allExpenses }: AnalyticsDashboardProps) => {
  const calculateStats = () => {
    const allExpensesList = Object.values(allExpenses).flat();
    const totalSpending = allExpensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const averagePerTrip = trips.length > 0 ? totalSpending / trips.length : 0;
    
    // Category analysis
    const categoryTotals: { [key: string]: number } = {};
    allExpensesList.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Monthly spending
    const monthlySpending: { [key: string]: number } = {};
    allExpensesList.forEach(expense => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      monthlySpending[month] = (monthlySpending[month] || 0) + expense.amount;
    });
    
    return {
      totalSpending,
      averagePerTrip,
      totalTrips: trips.length,
      totalExpenses: allExpensesList.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      categoryTotals,
      monthlySpending
    };
  };

  const stats = calculateStats();

  const getSpendingTrend = () => {
    const months = Object.keys(stats.monthlySpending).sort();
    if (months.length < 2) return 0;
    
    const lastMonth = stats.monthlySpending[months[months.length - 1]] || 0;
    const previousMonth = stats.monthlySpending[months[months.length - 2]] || 0;
    
    return previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
  };

  const spendingTrend = getSpendingTrend();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="text-xs text-gray-600">Total Spending</div>
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.totalSpending, 'USD')}</div>
            {spendingTrend !== 0 && (
              <div className={`flex items-center space-x-1 text-xs ${spendingTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                <TrendingUp className="w-3 h-3" />
                <span>{Math.abs(spendingTrend).toFixed(1)}% vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div className="text-xs text-gray-600">Average per Trip</div>
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.averagePerTrip, 'USD')}</div>
            <div className="text-xs text-gray-500">{stats.totalTrips} trips total</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <div className="text-xs text-gray-600">Total Receipts</div>
            </div>
            <div className="text-xl font-bold">{stats.totalExpenses}</div>
            <div className="text-xs text-gray-500">Across all trips</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-600 mb-1">Top Category</div>
            {stats.topCategory ? (
              <>
                <div className="text-lg font-semibold">{stats.topCategory.name}</div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(stats.topCategory.amount, 'USD')}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No expenses yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(stats.categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart categoryTotals={stats.categoryTotals} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trips.slice(0, 3).map(trip => {
              const tripExpenses = allExpenses[trip.id] || [];
              const tripTotal = tripExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              return (
                <div key={trip.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{trip.name}</div>
                    <div className="text-sm text-gray-600">
                      {tripExpenses.length} receipts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(tripTotal, 'USD')}</div>
                    <Badge className={trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {trip.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
