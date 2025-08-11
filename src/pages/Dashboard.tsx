import { useState, useEffect } from "react";
import { Plus, Settings, TrendingUp, Calendar, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { formatCurrency } from "@/utils/currencyUtils";
import { useSettings } from "@/contexts/SettingsContext";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, accentColor } = useSettings();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allExpenses, setAllExpenses] = useState<{ [tripId: string]: Expense[] }>({});

  useEffect(() => {
    const load = async () => {
      // Load trips from secure storage (with legacy fallback)
      const tripsData = await (await import('@/utils/secureStorage')).SecureExpenseStorage.getTrips();
      setTrips(tripsData);

      // Load all expenses per trip
      const expenseData: { [tripId: string]: Expense[] } = {};
      for (const trip of tripsData as Trip[]) {
        const tripExpenses = await (await import('@/utils/secureStorage')).SecureExpenseStorage.getTripExpenses(trip.id);
        expenseData[trip.id] = tripExpenses as Expense[];
      }
      setAllExpenses(expenseData);
    };
    load();
  }, []);

  const location = useLocation();
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  const createNewTrip = async () => {
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
    await (await import('@/utils/secureStorage')).SecureExpenseStorage.saveTrips(updatedTrips);
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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <Helmet>
        <title>Expense Zen — Travel Expense Dashboard</title>
        <meta name="description" content="Track travel expenses, receipts, and insights in Expense Zen." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className={`max-w-md mx-auto min-h-screen ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-xl`}>
        {/* Enhanced Header */}
        <div 
          className="relative overflow-hidden p-8 pb-12" 
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)` }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Expense Zen</h1>
                <p className="text-white/90 text-lg">Smart travel expense tracker</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-white hover:bg-white/20 transition-colors duration-200"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className={`${theme === 'dark' ? 'bg-gray-700/80 border-gray-600/50' : 'bg-white/95 border-white/30'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(getTotalSpent(), 'USD')}
                  </div>
                  <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Spent</div>
                </CardContent>
              </Card>
              
              <Card className={`${theme === 'dark' ? 'bg-gray-700/80 border-gray-600/50' : 'bg-white/95 border-white/30'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(getThisMonthSpent(), 'USD')}
                  </div>
                  <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This Month</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {trips.length === 0 ? (
            /* Enhanced Empty State */
            <div className="text-center py-12">
              <div className="mb-12">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <Plane className="w-12 h-12" style={{ color: accentColor }} />
                </div>
                <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ready for Your Adventure?
                </h2>
                <p className={`text-lg mb-2 max-w-xs mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start tracking your travel expenses effortlessly
                </p>
                <p className={`text-sm max-w-sm mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Create your first trip and begin managing your expenses like a pro
                </p>
              </div>

              {/* Enhanced Call to Action Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={createNewTrip}
                  className="w-full text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  size="lg"
                  style={{ backgroundColor: accentColor, borderColor: accentColor }}
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Start New Trip
                </Button>
                
                <Button 
                  onClick={createNewTrip}
                  variant="outline"
                  className={`w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  size="lg"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Plan Your First Trip
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-1 gap-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <span className="text-xs font-bold" style={{ color: accentColor }}>1</span>
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Create trips and organize expenses
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <span className="text-xs font-bold" style={{ color: accentColor }}>2</span>
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Track spending with smart categories
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <span className="text-xs font-bold" style={{ color: accentColor }}>3</span>
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Get insights and stay on budget
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Trips List */
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Trips</h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {trips.length} {trips.length === 1 ? 'trip' : 'trips'} tracked
                  </p>
                </div>
                <Button 
                  onClick={createNewTrip}
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'hover:shadow-xl border-gray-200'}`}
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {trip.name}
                            </h3>
                            <div 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${accentColor}20`, 
                                color: accentColor 
                              }}
                            >
                              Active
                            </div>
                          </div>
                          <div className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4" />
                            Started: {new Date(trip.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
                            {formatCurrency(tripTotal, 'USD')}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {tripExpenses.length} {tripExpenses.length === 1 ? 'expense' : 'expenses'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: accentColor,
                            width: tripExpenses.length > 0 ? '100%' : '20%'
                          }}
                        ></div>
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
