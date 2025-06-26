
import { useState, useEffect } from "react";
import { Plus, MapPin, Calendar, DollarSign, FileText, Search, Filter, Settings, BarChart3, GitCompare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { ExpenseFilter } from "@/components/ExpenseFilter";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { TripComparison } from "@/components/TripComparison";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allExpenses, setAllExpenses] = useState<{ [tripId: string]: Expense[] }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState('trips');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load trips and expenses from localStorage on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      const parsedTrips = JSON.parse(savedTrips) as Trip[];
      setTrips(parsedTrips);
      
      // Load expenses for all trips
      const expenses: { [tripId: string]: Expense[] } = {};
      parsedTrips.forEach(trip => {
        const savedExpenses = localStorage.getItem(`trip-${trip.id}-expenses`);
        if (savedExpenses) {
          expenses[trip.id] = JSON.parse(savedExpenses);
        }
      });
      setAllExpenses(expenses);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadData();
    setIsRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Your trips and expenses have been updated.",
    });
  };

  // Calculate trip totals from expenses
  const calculateTripStats = (tripId: string) => {
    const expenses = allExpenses[tripId] || [];
    return {
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      expenseCount: expenses.length
    };
  };

  const createNewTrip = () => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      name: "New Trip",
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      totalAmount: 0,
      expenseCount: 0,
      createdAt: new Date().toISOString()
    };

    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    navigate(`/trip/${newTrip.id}`);
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.destination || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTrips = filteredTrips.filter(trip => trip.status === 'active');
  const completedTrips = filteredTrips.filter(trip => trip.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Travel Expense Tracker</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-white hover:bg-white/20 p-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-white hover:bg-white/20 p-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-blue-100">Manage all your trips</p>
        </div>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trips">Trips</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="trips" className="space-y-4 mt-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>

              {/* New Trip Button */}
              <Button 
                onClick={createNewTrip}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Trip
              </Button>

              {/* Active Trips */}
              {activeTrips.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Trips</h2>
                  <div className="space-y-3">
                    {activeTrips.map((trip) => {
                      const stats = calculateTripStats(trip.id);
                      return (
                        <Card key={trip.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{trip.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                  {trip.destination && (
                                    <>
                                      <MapPin className="w-3 h-3 ml-2" />
                                      <span>{trip.destination}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>${stats.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{stats.expenseCount} receipts</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => navigate(`/trip/${trip.id}`)}
                              >
                                Continue
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Trips */}
              {completedTrips.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Completed Trips</h2>
                  <div className="space-y-3">
                    {completedTrips.map((trip) => {
                      const stats = calculateTripStats(trip.id);
                      return (
                        <Card key={trip.id} className="border-l-4 border-l-gray-400">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{trip.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                  {trip.endDate && (
                                    <span>- {new Date(trip.endDate).toLocaleDateString()}</span>
                                  )}
                                  {trip.destination && (
                                    <>
                                      <MapPin className="w-3 h-3 ml-2" />
                                      <span>{trip.destination}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>${stats.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{stats.expenseCount} receipts</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/trip/${trip.id}`)}
                              >
                                View Reports
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {trips.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No trips yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first trip to start tracking expenses
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <AnalyticsDashboard trips={trips} allExpenses={allExpenses} />
            </TabsContent>

            <TabsContent value="compare" className="mt-4">
              <TripComparison trips={trips} allExpenses={allExpenses} />
            </TabsContent>

            <TabsContent value="map" className="mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Map view showing all expense locations</p>
                      <p className="text-sm">Select a trip to view its expense map</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
