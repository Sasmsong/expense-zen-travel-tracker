
import { useState, useEffect } from "react";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { formatCurrency } from "@/utils/currencyUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allExpenses, setAllExpenses] = useState<{ [tripId: string]: Expense[] }>({});

  useEffect(() => {
    // Load trips
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }

    // Load all expenses
    const expenseData: { [tripId: string]: Expense[] } = {};
    const tripsData = savedTrips ? JSON.parse(savedTrips) : [];
    
    tripsData.forEach((trip: Trip) => {
      const tripExpenses = localStorage.getItem(`trip-${trip.id}-expenses`);
      if (tripExpenses) {
        expenseData[trip.id] = JSON.parse(tripExpenses);
      }
    });
    
    setAllExpenses(expenseData);
  }, []);

  const createNewTrip = () => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      name: `Trip ${trips.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalAmount: 0,
      expenseCount: 0,
      createdAt: new Date().toISOString()
    };

    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    navigate(`/trip/${newTrip.id}`);
  };

  const getTotalSpent = () => {
    let total = 0;
    Object.values(allExpenses).forEach(expenses => {
      total += expenses.reduce((sum, expense) => sum + expense.amount, 0);
    });
    return total;
  };

  const getThisMonthSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlyTotal = 0;
    
    Object.values(allExpenses).forEach(expenses => {
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
          monthlyTotal += expense.amount;
        }
      });
    });
    
    return monthlyTotal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Zen</h1>
              <p className="text-gray-600 mt-1">A smart travel expense tracker</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(getTotalSpent(), 'USD')}
                </div>
                <div className="text-sm text-blue-600 mt-1">Total Spent</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(getThisMonthSpent(), 'USD')}
                </div>
                <div className="text-sm text-green-600 mt-1">This Month</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {trips.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  No Trips Recorded
                </h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                  Start tracking your travel expenses by creating your first trip
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={createNewTrip}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Trip
                </Button>
                
                <Button 
                  onClick={createNewTrip}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 py-4 text-lg font-medium"
                  size="lg"
                >
                  Plan Your First Trip
                </Button>
              </div>
            </div>
          ) : (
            /* Trips List */
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
                <Button 
                  onClick={createNewTrip}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Trip
                </Button>
              </div>

              {trips.map((trip) => {
                const tripExpenses = allExpenses[trip.id] || [];
                const tripTotal = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0);

                return (
                  <Card 
                    key={trip.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">{trip.name}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(tripTotal, 'USD')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tripExpenses.length} expenses
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Started: {new Date(trip.startDate).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
