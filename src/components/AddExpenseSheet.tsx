
import { useState, useEffect } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/TagInput";
import { PhotoCapture } from "@/components/PhotoCapture";
import { CurrencyConversion } from "@/components/CurrencyConversion";
import { Expense } from "@/types/Expense";
import { getStoredBaseCurrency, convertCurrency } from "@/utils/currencyUtils";
import { isRecurringExpense, getSuggestedCategory } from "@/utils/recurringUtils";

interface AddExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
  existingExpenses?: Expense[];
}

const PRESET_CATEGORIES = [
  "Food", "Coffee", "Hotel", "Flights", "Transportation", "Entertainment", "Other"
];

export const AddExpenseSheet = ({ isOpen, onClose, onAddExpense, existingExpenses = [] }: AddExpenseSheetProps) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [originalAmount, setOriginalAmount] = useState("");
  const [originalCurrency, setOriginalCurrency] = useState("");
  const [showCurrencyConversion, setShowCurrencyConversion] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const baseCurrency = getStoredBaseCurrency();

  useEffect(() => {
    if (merchant.trim() && existingExpenses.length > 0) {
      const recurring = isRecurringExpense(merchant, existingExpenses);
      setIsRecurring(recurring);
      
      if (recurring) {
        const suggestedCategory = getSuggestedCategory(merchant, existingExpenses);
        if (suggestedCategory && !category) {
          setCategory(suggestedCategory);
        }
      }
    }
  }, [merchant, existingExpenses, category]);

  const simulateOCR = (filename: string) => {
    const mockData = {
      merchant: filename.includes('starbucks') ? 'Starbucks' : 
                filename.includes('hotel') ? 'Hotel California' : 
                'Sample Merchant',
      amount: Math.floor(Math.random() * 100) + 10,
      category: filename.includes('coffee') ? 'Coffee' : 
                filename.includes('hotel') ? 'Hotel' : 'Food'
    };
    
    setMerchant(mockData.merchant);
    setAmount(mockData.amount.toString());
    setCategory(mockData.category);
  };

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

  const resetForm = () => {
    setMerchant("");
    setAmount("");
    setCategory("");
    setCustomCategory("");
    setShowCustomCategory(false);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setPhoto(null);
    setTags([]);
    setOriginalAmount("");
    setOriginalCurrency("");
    setShowCurrencyConversion(false);
    setIsRecurring(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = showCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    if (!merchant || (!amount && !originalAmount) || !finalCategory) return;

    const finalAmount = getConvertedAmount();
    const exchangeRate = showCurrencyConversion && originalAmount && originalCurrency
      ? finalAmount / parseFloat(originalAmount)
      : undefined;

    const expense: Expense = {
      id: Date.now().toString(),
      merchant,
      amount: finalAmount,
      category: finalCategory,
      date,
      notes,
      photo,
      tags,
      currency: baseCurrency,
      originalAmount: showCurrencyConversion ? parseFloat(originalAmount) : undefined,
      originalCurrency: showCurrencyConversion ? originalCurrency : undefined,
      exchangeRate,
      isRecurring
    };

    onAddExpense(expense);
    resetForm();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <PhotoCapture 
            photo={photo}
            onPhotoChange={setPhoto}
            onPhotoCapture={simulateOCR}
          />

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
            {isRecurring && (
              <Badge className="bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>

          <CurrencyConversion
            showCurrencyConversion={showCurrencyConversion}
            onToggle={() => setShowCurrencyConversion(!showCurrencyConversion)}
            amount={amount}
            onAmountChange={setAmount}
            originalAmount={originalAmount}
            onOriginalAmountChange={setOriginalAmount}
            originalCurrency={originalCurrency}
            onOriginalCurrencyChange={setOriginalCurrency}
            convertedAmount={getConvertedAmount()}
            baseCurrency={baseCurrency}
          />

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
              Add Expense
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
