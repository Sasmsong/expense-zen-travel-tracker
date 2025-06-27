import { useState, useEffect } from "react";
import { Camera, Plus, FileText, Download, ArrowLeft, Edit2, Check, BarChart3, Map as MapIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseFilter } from "@/components/ExpenseFilter";
import { MapView } from "@/components/MapView";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { TripHeader } from "@/components/TripHeader";
import { ExportOptions } from "@/components/ExportOptions";
import { SpendingChart } from "@/components/SpendingChart";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Trip } from "@/types/Trip";
import { Expense } from "@/types/Expense";
import { HelpTooltip } from "@/components/HelpTooltip";

const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempTripName, setTempTripName] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  // Load trip and expenses on component mount
  useEffect(() => {
    if (!tripId) return;

    // Load trip data
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      const trips = JSON.parse(savedTrips) as Trip[];
      const currentTrip = trips.find(t => t.id === tripId);
      if (currentTrip) {
        setTrip(currentTrip);
        setTempTripName(currentTrip.name);
      }
    }

    // Load expenses for this trip
    const savedExpenses = localStorage.getItem(`trip-${tripId}-expenses`);
    if (savedExpenses) {
      const loadedExpenses = JSON.parse(savedExpenses);
      setExpenses(loadedExpenses);
      setFilteredExpenses(loadedExpenses);
    }
  }, [tripId]);

  const saveTrip = (updatedTrip: Trip) => {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      const trips = JSON.parse(savedTrips) as Trip[];
      const updatedTrips = trips.map(t => t.id === tripId ? updatedTrip : t);
      localStorage.setItem('trips', JSON.stringify(updatedTrips));
      setTrip(updatedTrip);
    }
  };

  const saveExpenses = (newExpenses: Expense[]) => {
    localStorage.setItem(`trip-${tripId}-expenses`, JSON.stringify(newExpenses));
    setExpenses(newExpenses);
    setFilteredExpenses(newExpenses);
  };

  const addExpense = (expense: Expense) => {
    const newExpenses = [...expenses, expense];
    saveExpenses(newExpenses);
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter(exp => exp.id !== id);
    saveExpenses(newExpenses);
  };

  const updateExpense = (id: string, updatedExpense: Expense) => {
    const newExpenses = expenses.map(exp => exp.id === id ? updatedExpense : exp);
    saveExpenses(newExpenses);
  };

  const handleTripNameSave = () => {
    if (trip && tempTripName.trim()) {
      const updatedTrip = { ...trip, name: tempTripName.trim() };
      saveTrip(updatedTrip);
      setIsEditingName(false);
    }
  };

  const completeTrip = () => {
    if (trip) {
      const updatedTrip = {
        ...trip,
        status: 'completed' as const,
        endDate: new Date().toISOString().split('T')[0]
      };
      saveTrip(updatedTrip);
    }
  };

  const reopenTrip = () => {
    if (trip) {
      const updatedTrip = {
        ...trip,
        status: 'active' as const,
        endDate: undefined
      };
      saveTrip(updatedTrip);
    }
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = () => {
    const totals: { [key: string]: number } = {};
    filteredExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Trip not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-1 transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Input
                    value={tempTripName}
                    onChange={(e) => setTempTripName(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 text-lg font-semibold transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleTripNameSave()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTripNameSave}
                    className="text-white hover:bg-white/20 p-1 transition-all duration-200 hover:scale-110"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">{trip.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                    className="text-white hover:bg-white/20 p-1 transition-all duration-200 hover:scale-110"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <HelpTooltip content="Click to edit trip name" side="bottom" />
                </div>
              )}
            </div>
            
            <Badge className={trip.status === 'active' ? 'bg-green-500 transition-all duration-200' : 'bg-gray-500 transition-all duration-200'}>
              {trip.status === 'active' ? 'Active' : 'Completed'}
            </Badge>
          </div>
          
          <TripHeader 
            tripName={trip.name}
            onTripChange={() => {}} // Name editing handled above
            totalAmount={getTotalAmount()}
            expenseCount={filteredExpenses.length}
          />
        </div>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expenses" className="transition-all duration-200">
                <span className="flex items-center gap-1">
                  Expenses
                  <HelpTooltip content="View and manage all trip expenses" />
                </span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="transition-all duration-200">Analytics</TabsTrigger>
              <TabsTrigger value="map" className="transition-all duration-200">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-4 mt-4 animate-fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${getTotalAmount().toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Spent</div>
                  </CardContent>
                </Card>
                <Card className="transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredExpenses.length}
                    </div>
                    <div className="text-sm text-gray-600">Receipts</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <ExpenseFilter
                expenses={expenses}
                onFilteredExpenses={setFilteredExpenses}
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Receipt
                    <HelpTooltip content="Take a photo or manually add an expense" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExportOpen(true)}
                    disabled={expenses.length === 0}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                
                {trip.status === 'active' && expenses.length > 0 && (
                  <Button 
                    onClick={completeTrip}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Trip as Complete
                  </Button>
                )}

                {trip.status === 'completed' && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => setIsExportOpen(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View & Export Reports
                    </Button>
                    <Button 
                      onClick={reopenTrip}
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Reopen Trip for Editing
                    </Button>
                  </div>
                )}
              </div>

              {/* Expense List */}
              <div className="animate-fade-in">
                <ExpenseList 
                  expenses={filteredExpenses}
                  onDelete={deleteExpense}
                  onUpdate={updateExpense}
                />
              </div>

              {filteredExpenses.length === 0 && expenses.length > 0 && (
                <div className="text-center py-8">
                  <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No expenses match your filters</p>
                </div>
              )}

              {expenses.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by taking a photo of your first receipt
                  </p>
                  <Button 
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Receipt
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chart" className="mt-4 animate-fade-in">
              {expenses.length > 0 ? (
                <Card className="transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Spending Breakdown
                      <HelpTooltip content="Visual breakdown of your expenses by category" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpendingChart categoryTotals={getCategoryTotals()} />
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Add expenses to see analytics</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-4 animate-fade-in">
              {expenses.length > 0 ? (
                <div className="transition-all duration-300">
                  <MapView expenses={filteredExpenses} />
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Add expenses to see locations on map</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <AddExpenseSheet 
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          onAddExpense={addExpense}
          existingExpenses={expenses}
        />

        <ExportOptions
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          expenses={expenses}
          categoryTotals={getCategoryTotals()}
          tripName={trip.name}
        />
      </div>
    </div>
  );
};

export default TripDetails;
