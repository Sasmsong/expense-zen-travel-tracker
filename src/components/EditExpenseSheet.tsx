
import { useState, useEffect } from "react";
import { Plus, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/TagInput";
import { CurrencySelector } from "@/components/CurrencySelector";
import { Expense } from "@/types/Expense";
import { getStoredBaseCurrency, convertCurrency, formatCurrency } from "@/utils/currencyUtils";

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
  const [tags, setTags] = useState<string[]>([]);
  const [currency, setCurrency] = useState(getStoredBaseCurrency());
  const [originalAmount, setOriginalAmount] = useState("");
  const [originalCurrency, setOriginalCurrency] = useState("");
  const [showCurrencyConversion, setShowCurrencyConversion] = useState(false);

  const baseCurrency = getStoredBaseCurrency();

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
      setTags(expense.tags || []);
      setCurrency(expense.currency || baseCurrency);
      
      // Set up currency conversion if original currency data exists
      if (expense.originalAmount && expense.originalCurrency) {
        setOriginalAmount(expense.originalAmount.toString());
        setOriginalCurrency(expense.originalCurrency);
        setShowCurrencyConversion(true);
      }
    }
  }, [expense, baseCurrency]);

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

  const getConvertedAmount = () => {
    if (!showCurrencyConversion || !originalAmount || !originalCurrency) {
      return parseFloat(amount) || 0;
    }
    return convertCurrency(parseFloat(originalAmount), originalCurrency, baseCurrency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = showCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    if (!merchant || !amount || !finalCategory) return;

    const finalAmount = getConvertedAmount();
    const exchangeRate = showCurrencyConversion && originalAmount && originalCurrency
      ? finalAmount / parseFloat(originalAmount)
      : expense.exchangeRate;

    const updatedExpense: Expense = {
      ...expense,
      merchant,
      amount: finalAmount,
      category: finalCategory,
      date,
      notes,
      tags,
      currency: baseCurrency,
      originalAmount: showCurrencyConversion ? parseFloat(originalAmount) : undefined,
      originalCurrency: showCurrencyConversion ? originalCurrency : undefined,
      exchangeRate
    };

    onUpdate(expense.id, updatedExpense);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Expense</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Show existing photo if available */}
          {expense?.photo && (
            <div className="space-y-2">
              <Label>Receipt Photo</Label>
              <img src={expense.photo} alt="Receipt photo" loading="lazy" decoding="async" className="w-full h-32 object-cover rounded-lg" />
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
            {expense.isRecurring && (
              <Badge className="bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>

          {/* Currency Conversion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Amount *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCurrencyConversion(!showCurrencyConversion)}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {showCurrencyConversion ? 'Hide' : 'Convert'} Currency
              </Button>
            </div>
            
            {showCurrencyConversion ? (
              <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="originalAmount">Original Amount</Label>
                    <Input
                      id="originalAmount"
                      type="number"
                      step="0.01"
                      value={originalAmount}
                      onChange={(e) => setOriginalAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label>Original Currency</Label>
                    <CurrencySelector
                      value={originalCurrency}
                      onValueChange={setOriginalCurrency}
                      placeholder="Currency"
                    />
                  </div>
                </div>
                {originalAmount && originalCurrency && (
                  <div className="text-sm text-gray-600">
                    = {formatCurrency(getConvertedAmount(), baseCurrency)} (converted to {baseCurrency})
                  </div>
                )}
              </div>
            ) : (
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            )}
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

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} onTagsChange={setTags} />
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
