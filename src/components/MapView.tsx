
import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types/Expense';
import { formatCurrency } from '@/utils/currencyUtils';

interface MapViewProps {
  expenses: Expense[];
}

const categoryColors: { [key: string]: string } = {
  "Food": "#FF6B35",
  "Coffee": "#F7931E", 
  "Hotel": "#9B59B6",
  "Flights": "#3498DB",
  "Transportation": "#2ECC71",
  "Entertainment": "#E91E63",
  "Other": "#95A5A6"
};

// Mock location data - in a real app, you'd get this from GPS or address lookup
const getMockLocation = (merchant: string) => {
  const locations: { [key: string]: { lat: number; lng: number; address: string } } = {
    'Starbucks': { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
    'McDonald\'s': { lat: 40.7589, lng: -73.9851, address: 'Times Square, NY' },
    'Hotel California': { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
    'Uber': { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' }
  };
  
  // Default to a random location in US if merchant not found
  return locations[merchant] || {
    lat: 39.8283 + (Math.random() - 0.5) * 10,
    lng: -98.5795 + (Math.random() - 0.5) * 40,
    address: 'United States'
  };
};

export const MapView = ({ expenses }: MapViewProps) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseLocations, setExpenseLocations] = useState<(Expense & { location: any })[]>([]);

  useEffect(() => {
    const locatedExpenses = expenses.map(expense => ({
      ...expense,
      location: getMockLocation(expense.merchant)
    }));
    setExpenseLocations(locatedExpenses);
  }, [expenses]);

  return (
    <div className="space-y-4">
      {/* Map placeholder - in a real implementation, you'd use Google Maps or Mapbox */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Interactive Map View</p>
          <p className="text-sm text-gray-500">Expense locations would appear here</p>
        </div>
        
        {/* Simulated pins */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {expenseLocations.slice(0, 5).map((expense, index) => (
            <button
              key={expense.id}
              className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: categoryColors[expense.category] || '#95A5A6',
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`
              }}
              onClick={() => setSelectedExpense(expense)}
            >
              $
            </button>
          ))}
        </div>
      </div>

      {/* Selected expense details */}
      {selectedExpense && (
        <Card className="border-l-4" style={{ borderColor: categoryColors[selectedExpense.category] }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{selectedExpense.merchant}</h3>
                <p className="text-sm text-gray-600">{selectedExpense.location.address}</p>
                <p className="text-xs text-gray-500">{new Date(selectedExpense.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {formatCurrency(selectedExpense.amount, selectedExpense.currency || 'USD')}
                </div>
                <Badge className="text-xs" style={{ backgroundColor: categoryColors[selectedExpense.category] }}>
                  {selectedExpense.category}
                </Badge>
              </div>
            </div>
            
            {selectedExpense.photo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Image className="w-4 h-4" />
                <span>Receipt photo available</span>
              </div>
            )}
            
            {selectedExpense.notes && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {selectedExpense.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Category Legend</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location list */}
      <div className="space-y-2">
        <h3 className="font-semibold">Expense Locations</h3>
        {expenseLocations.map((expense) => (
          <Card 
            key={expense.id} 
            className={`cursor-pointer transition-all ${selectedExpense?.id === expense.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedExpense(expense)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[expense.category] }}
                  />
                  <div>
                    <div className="font-medium">{expense.merchant}</div>
                    <div className="text-sm text-gray-600">{expense.location.address}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(expense.amount, expense.currency || 'USD')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
