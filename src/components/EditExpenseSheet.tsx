
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Expense } from "@/pages/Index";

interface EditExpenseSheetProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, expense: Expense) => void;
}

const PRESET_CATEGORIES = [
  "Food", "Coffee", "Hotel", "Flights", "Transportation", "Entertainment", "Other"
];

export const EditExpenseSheet = ({ expense, isOpen, onClose, onUpdate }: EditExpenseSheetProps) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (expense) {
      setMerchant(expense.merchant);
      setAmount(expense.amount.toString());
      
      // Check if category is a preset or custom
      if (PRESET_CATEGORIES.includes(expense.category)) {
        setCategory(expense.category);
        setShowCustomCategory(false);
        setCustomCategory("");
      } else {
        setCategory("");
        setCustomCategory(expense.category);
        setShowCustomCategory(true);
      }
      
      setDate(expense.date);
      setNotes(expense.notes || "");
    }
  }, [expense]);

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true);
      setCategory("");
    } else {
      setShowCustomCategory(false);
      setCategory(value);
      setCustomCategory("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = showCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    if (!merchant || !amount || !finalCategory) return;

    const updatedExpense: Expense = {
      ...expense,
      merchant,
      amount: parseFloat(amount),
      category: finalCategory,
      date,
      notes
    };

    onUpdate(expense.id, updatedExpense);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Edit Expense</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Show existing photo if available */}
          {expense?.photo && (
            <div className="space-y-2">
              <Label>Receipt Photo</Label>
              <img src={expense.photo} alt="Receipt" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}

          {/* Merchant */}
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant *</Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Where did you shop?"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select onValueChange={handleCategoryChange} value={showCustomCategory ? "custom" : category}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Custom Category
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {showCustomCategory && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                required
              />
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Update Expense
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
