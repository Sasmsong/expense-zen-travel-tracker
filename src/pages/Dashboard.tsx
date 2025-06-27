import { useState, useEffect } from "react";
import { Plus, BarChart3, Settings, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { TripComparison } from "@/components/TripComparison";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { HelpTooltip } from "@/components/HelpTooltip";
import { formatCurrency } from "@/utils/currencyUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allExpenses, setAllExpenses] = useState<{ [tripId: string]: Expense[] }>({});
  const [showOnboarding, setShowOnboarding] = useState(false);

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

    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && tripsData.length === 0) {
      setShowOnboarding(true);
    }
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

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const getTripTotal = (tripId: string) => {
    const expenses = allExpenses[tripId] || [];
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Expense Zen</h1>
              <p className="text-blue-100">Travel expense tracker</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="trips" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="trips" className="transition-all duration-200">My Trips</TabsTrigger>
              <TabsTrigger value="analytics" className="transition-all duration-200">Analytics</TabsTrigger>
              <TabsTrigger value="compare" className="transition-all duration-200">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="space-y-4 animate-fade-in">
              {/* Quick Action */}
              <Card className="border-dashed border-2 border-blue-200 hover:border-blue-300 transition-colors duration-200">
                <CardContent className="p-4">
                  <Button 
                    onClick={createNewTrip}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Trip
                  </Button>
                </CardContent>
              </Card>

              {/* Trip Cards */}
              {trips.length > 0 ? (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const tripTotal = getTripTotal(trip.id);
                    const expenseCount = (allExpenses[trip.id] || []).length;

                    return (
                      <Card 
                        key={trip.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                        onClick={() => navigate(`/trip/${trip.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{trip.name}</h3>
                            <Badge 
                              className={trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {trip.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {trip.startDate} {trip.endDate && `- ${trip.endDate}`}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-xl font-bold text-green-600">
                                  {formatCurrency(tripTotal, 'USD')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                  <BarChart3 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                                  <MapPin className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                    <p className="text-gray-600 mb-4">Create your first trip to start tracking expenses</p>
                  </div>
                  <Button 
                    onClick={createNewTrip}
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Trip
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Analytics Overview</h2>
                <HelpTooltip content="View spending patterns and insights across all your trips" />
              </div>
              <AnalyticsDashboard trips={trips} allExpenses={allExpenses} />
            </TabsContent>

            <TabsContent value="compare" className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">Trip Comparison</h2>
                <HelpTooltip content="Compare spending between different trips to identify patterns" />
              </div>
              <TripComparison trips={trips} allExpenses={allExpenses} />
            </TabsContent>
          </Tabs>
        </div>

        <OnboardingGuide 
          isOpen={showOnboarding} 
          onClose={handleOnboardingClose} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
