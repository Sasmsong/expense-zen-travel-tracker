
import { useState, useEffect } from "react";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { formatCurrency } from "@/utils/currencyUtils";
import { useSettings } from "@/contexts/SettingsContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, accentColor } = useSettings();
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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md mx-auto min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)` }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Expense Zen</h1>
              <p className="text-white/80 mt-1">A smart travel expense tracker</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className={`${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/90 border-white/20'} backdrop-blur-sm`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(getTotalSpent(), 'USD')}
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Spent</div>
              </CardContent>
            </Card>
            
            <Card className={`${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-white/90 border-white/20'} backdrop-blur-sm`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(getThisMonthSpent(), 'USD')}
                </div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This Month</div>
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
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${accentColor}20` }}>
                  <Plus className="w-10 h-10" style={{ color: accentColor }} />
                </div>
                <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  No Trips Recorded
                </h2>
                <p className={`mb-8 max-w-sm mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start tracking your travel expenses by creating your first trip
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={createNewTrip}
                  className="w-full text-white py-4 text-lg font-medium"
                  size="lg"
                  style={{ backgroundColor: accentColor, borderColor: accentColor }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Trip
                </Button>
                
                <Button 
                  onClick={createNewTrip}
                  variant="outline"
                  className={`w-full py-4 text-lg font-medium ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  size="lg"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  Plan Your First Trip
                </Button>
              </div>
            </div>
          ) : (
            /* Trips List */
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Trips</h2>
                <Button 
                  onClick={createNewTrip}
                  className="text-white"
                  style={{ backgroundColor: accentColor }}
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
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:shadow-lg'}`}
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{trip.name}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold" style={{ color: accentColor }}>
                            {formatCurrency(tripTotal, 'USD')}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {tripExpenses.length} expenses
                          </div>
                        </div>
                      </div>
                      
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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
