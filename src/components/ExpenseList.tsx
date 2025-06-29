
import { useState } from "react";
import { Pencil, Trash2, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditExpenseSheet } from "@/components/EditExpenseSheet";
import { Expense } from "@/types/Expense";
import { formatCurrency } from "@/utils/currencyUtils";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, expense: Expense) => void;
}

const categoryColors: { [key: string]: string } = {
  "Food": "bg-orange-100 text-orange-800",
  "Coffee": "bg-amber-100 text-amber-800",
  "Hotel": "bg-purple-100 text-purple-800",
  "Flights": "bg-blue-100 text-blue-800",
  "Transportation": "bg-green-100 text-green-800",
  "Entertainment": "bg-pink-100 text-pink-800",
  "Other": "bg-gray-100 text-gray-800"
};

export const ExpenseList = ({ expenses, onDelete, onUpdate }: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-indigo-100 text-indigo-800";
  };

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => (
        <Card key={expense.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{expense.merchant}</h3>
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                  {expense.isRecurring && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(expense.amount, expense.currency || 'USD')}
                </div>
                {expense.originalAmount && expense.originalCurrency && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(expense.originalAmount, expense.originalCurrency)}
                  </div>
                )}
                <div className="flex gap-1 mt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(expense.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags */}
            {expense.tags && expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {expense.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {expense.photo && (
              <div className="mt-3">
                <img 
                  src={expense.photo} 
                  alt="Receipt" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            {expense.notes && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {expense.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {editingExpense && (
        <EditExpenseSheet
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};
