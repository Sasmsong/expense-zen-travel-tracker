import { useState } from "react";
import { Camera, Plus, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseList } from "@/components/ExpenseList";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { TripHeader } from "@/components/TripHeader";
import { ExportOptions } from "@/components/ExportOptions";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  photo?: string;
  notes?: string;
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState("Business Trip - NYC");
  const location = useLocation();
  const canonicalUrl = `${window.location.origin}${location.pathname}`;


  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const updateExpense = (id: string, updatedExpense: Expense) => {
    setExpenses(expenses.map(exp => exp.id === id ? updatedExpense : exp));
  };

  const getTotalAmount = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = () => {
    const totals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Spend Savvy — Legacy</title>
        <meta name="description" content="Legacy demo page for Spend Savvy travel expense tracker." />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <TripHeader 
          tripName={currentTrip}
          onTripChange={setCurrentTrip}
          totalAmount={getTotalAmount()}
          expenseCount={expenses.length}
        />

        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${getTotalAmount().toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {expenses.length}
                </div>
                <div className="text-sm text-gray-600">Receipts</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Receipt
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsExportOpen(true)}
              disabled={expenses.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Expense List */}
          <ExpenseList 
            expenses={expenses}
            onDelete={deleteExpense}
            onUpdate={updateExpense}
          />

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
          tripName={currentTrip}
        />
      </div>
    </div>
  );
};

export default Index;
