
import { useState } from "react";
import { Pencil, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditExpenseSheet } from "@/components/EditExpenseSheet";
import { Expense } from "@/pages/Index";

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
  "Miscellaneous": "bg-gray-100 text-gray-800"
};

export const ExpenseList = ({ expenses, onDelete, onUpdate }: ExpenseListProps) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => (
        <Card key={expense.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{expense.merchant}</h3>
                  <Badge className={categoryColors[expense.category] || categoryColors["Miscellaneous"]}>
                    {expense.category}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${expense.amount.toFixed(2)}
                </div>
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
