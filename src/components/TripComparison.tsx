
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign } from 'lucide-react';
import { Trip } from '@/types/Trip';
import { Expense } from '@/types/Expense';
import { formatCurrency } from '@/utils/currencyUtils';
import { SpendingChart } from '@/components/SpendingChart';

interface TripComparisonProps {
  trips: Trip[];
  allExpenses: { [tripId: string]: Expense[] };
}

export const TripComparison = ({ trips, allExpenses }: TripComparisonProps) => {
  const [trip1Id, setTrip1Id] = useState<string>('');
  const [trip2Id, setTrip2Id] = useState<string>('');

  const getComparisonData = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    const expenses = allExpenses[tripId] || [];
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const avgPerDay = trip ? totalAmount / Math.max(1, 
      Math.ceil((new Date(trip.endDate || new Date()).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))
    ) : 0;

    return {
      trip,
      expenses,
      totalAmount,
      categoryTotals,
      avgPerDay,
      expenseCount: expenses.length
    };
  };

  const trip1Data = trip1Id ? getComparisonData(trip1Id) : null;
  const trip2Data = trip2Id ? getComparisonData(trip2Id) : null;

  const getPercentageDiff = (val1: number, val2: number) => {
    if (val2 === 0) return val1 > 0 ? 100 : 0;
    return ((val1 - val2) / val2) * 100;
  };

  const renderComparisonMetric = (label: string, val1: number, val2: number, format: 'currency' | 'number' = 'number') => {
    const diff = getPercentageDiff(val1, val2);
    const formatValue = (val: number) => format === 'currency' ? formatCurrency(val, 'USD') : val.toString();

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold">{formatValue(val1)}</div>
            <div className="text-xs text-gray-500">Trip 1</div>
          </div>
          <div className="flex items-center">
            {Math.abs(diff) < 1 ? (
              <Minus className="w-4 h-4 text-gray-400" />
            ) : diff > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-xs ml-1 ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>
              {Math.abs(diff).toFixed(0)}%
            </span>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatValue(val2)}</div>
            <div className="text-xs text-gray-500">Trip 2</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Trips to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium">Trip 1</label>
              <Select value={trip1Id} onValueChange={setTrip1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id} disabled={trip.id === trip2Id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{trip.name}</span>
                        <Badge className={trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {trip.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Trip 2</label>
              <Select value={trip2Id} onValueChange={setTrip2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id} disabled={trip.id === trip1Id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{trip.name}</span>
                        <Badge className={trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {trip.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {trip1Data && trip2Data && (
        <>
          {/* Trip Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{trip1Data.trip?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(trip1Data.trip?.startDate || '').toLocaleDateString()}</span>
                  {trip1Data.trip?.endDate && (
                    <span>- {new Date(trip1Data.trip.endDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold">{formatCurrency(trip1Data.totalAmount, 'USD')}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {trip1Data.expenseCount} receipts • {formatCurrency(trip1Data.avgPerDay, 'USD')}/day
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{trip2Data.trip?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(trip2Data.trip?.startDate || '').toLocaleDateString()}</span>
                  {trip2Data.trip?.endDate && (
                    <span>- {new Date(trip2Data.trip.endDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold">{formatCurrency(trip2Data.totalAmount, 'USD')}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {trip2Data.expenseCount} receipts • {formatCurrency(trip2Data.avgPerDay, 'USD')}/day
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderComparisonMetric('Total Spending', trip1Data.totalAmount, trip2Data.totalAmount, 'currency')}
              {renderComparisonMetric('Number of Receipts', trip1Data.expenseCount, trip2Data.expenseCount)}
              {renderComparisonMetric('Average per Day', trip1Data.avgPerDay, trip2Data.avgPerDay, 'currency')}
            </CardContent>
          </Card>

          {/* Category Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {trip1Data.trip?.name} - Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpendingChart categoryTotals={trip1Data.categoryTotals} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {trip2Data.trip?.name} - Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpendingChart categoryTotals={trip2Data.categoryTotals} />
              </CardContent>
            </Card>
          </div>

          {/* Category-by-Category Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...new Set([
                  ...Object.keys(trip1Data.categoryTotals),
                  ...Object.keys(trip2Data.categoryTotals)
                ])].map(category => {
                  const val1 = trip1Data.categoryTotals[category] || 0;
                  const val2 = trip2Data.categoryTotals[category] || 0;
                  return renderComparisonMetric(category, val1, val2, 'currency');
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(!trip1Data || !trip2Data) && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <p>Select two trips to compare their spending patterns</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
