import { useState, useEffect } from "react";
import { Plus, Tag, DollarSign, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { PhotoCapture } from "@/components/PhotoCapture";
import { TagInput } from "@/components/TagInput";
import { VoiceInput } from "@/components/VoiceInput";
import { CurrencySelector } from "@/components/CurrencySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { HelpTooltip } from "@/components/HelpTooltip";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import { Expense } from "@/types/Expense";
import { getStoredBaseCurrency, convertCurrency, formatCurrency } from "@/utils/currencyUtils";
import { getRecurringExpenses } from "@/utils/recurringUtils";

interface AddExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
  existingExpenses: Expense[];
}

const PRESET_CATEGORIES = [
  "Food", "Coffee", "Hotel", "Flights", "Transportation", "Entertainment", "Other"
];

export const AddExpenseSheet = ({ isOpen, onClose, onAddExpense, existingExpenses }: AddExpenseSheetProps) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currency, setCurrency] = useState(getStoredBaseCurrency());
  const [originalAmount, setOriginalAmount] = useState("");
  const [originalCurrency, setOriginalCurrency] = useState("");
  const [showCurrencyConversion, setShowCurrencyConversion] = useState(false);
  const [hotelCheckIn, setHotelCheckIn] = useState<Date>();
  const [hotelCheckOut, setHotelCheckOut] = useState<Date>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const baseCurrency = getStoredBaseCurrency();

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

  const handlePhotoCapture = (photo: string | null) => {
    setCapturedPhoto(photo);
  };

  const handleVoiceResult = (result: { merchant: string; amount: string; category?: string }) => {
    setMerchant(result.merchant);
    setAmount(result.amount);
    if (result.category) {
      setCategory(result.category);
    }
  };

  const getSmartSuggestions = () => {
    const recurringMerchants = getRecurringExpenses(existingExpenses).map(expense => expense.merchant);
    const uniqueMerchants = [...new Set(recurringMerchants)];
    return uniqueMerchants.filter(item =>
      item.toLowerCase().includes(merchant.toLowerCase()) && item !== merchant
    );
  };

  const getIsRecurring = (merchant: string, existingExpenses: Expense[]) => {
    const recurringMerchants = getRecurringExpenses(existingExpenses).map(expense => expense.merchant);
    return recurringMerchants.includes(merchant);
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
      : undefined;

    // Add hotel dates to notes if it's a hotel expense
    let finalNotes = notes;
    if (finalCategory.toLowerCase() === 'hotel' && hotelCheckIn && hotelCheckOut) {
      const checkInStr = hotelCheckIn.toLocaleDateString();
      const checkOutStr = hotelCheckOut.toLocaleDateString();
      finalNotes = `${notes ? notes + '\n' : ''}Stay: ${checkInStr} - ${checkOutStr}`;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      merchant,
      amount: finalAmount,
      category: finalCategory,
      date: date || new Date().toISOString().split('T')[0],
      notes: finalNotes,
      photo: capturedPhoto,
      tags,
      currency: baseCurrency,
      originalAmount: showCurrencyConversion ? parseFloat(originalAmount) : undefined,
      originalCurrency: showCurrencyConversion ? originalCurrency : undefined,
      exchangeRate,
      isRecurring: getIsRecurring(merchant, existingExpenses)
    };

    onAddExpense(newExpense);
    
    // Show success animation
    setSuccessMessage('Expense saved successfully!');
    setShowSuccess(true);
    
    // Reset form after short delay
    setTimeout(() => {
      resetForm();
      onClose();
    }, 500);
  };

  const resetForm = () => {
    setMerchant("");
    setAmount("");
    setCategory("");
    setCustomCategory("");
    setShowCustomCategory(false);
    setDate("");
    setNotes("");
    setTags([]);
    setCapturedPhoto(null);
    setCurrency(baseCurrency);
    setOriginalAmount("");
    setOriginalCurrency("");
    setShowCurrencyConversion(false);
    setHotelCheckIn(undefined);
    setHotelCheckOut(undefined);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto transition-all duration-300">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Add New Expense
              <HelpTooltip content="Take a photo or manually enter expense details. Use voice input for quick logging." />
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* Photo Capture */}
            <div className="space-y-2">
              <Label>Receipt Photo</Label>
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Receipt" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <PhotoCapture onCapture={handlePhotoCapture} />
              )}
            </div>

            {/* Merchant with voice input */}
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant *</Label>
              <div className="flex gap-2">
                <Input
                  id="merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Where did you shop?"
                  required
                  className="flex-1 transition-all duration-200 focus:scale-[1.02]"
                />
                <VoiceInput onVoiceResult={handleVoiceResult} />
              </div>
              {/* Smart suggestions */}
              {merchant && (
                <div className="flex flex-wrap gap-1">
                  {getSmartSuggestions().map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMerchant(suggestion)}
                      className="text-xs transition-all duration-200 hover:scale-105"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
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
                <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
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
                  className="animate-fade-in transition-all duration-200 focus:scale-[1.02]"
                />
              )}
            </div>

            {/* Hotel Date Selection */}
            {(category === 'Hotel' || customCategory.toLowerCase().includes('hotel')) && (
              <div className="space-y-2 animate-fade-in">
                <Label className="flex items-center gap-2">
                  Hotel Stay Dates
                  <HelpTooltip content="Select your check-in and check-out dates for hotel stays" />
                </Label>
                <DateRangePicker
                  checkIn={hotelCheckIn}
                  checkOut={hotelCheckOut}
                  onDatesChange={(checkIn, checkOut) => {
                    setHotelCheckIn(checkIn);
                    setHotelCheckOut(checkOut);
                  }}
                />
              </div>
            )}

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
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 transition-all duration-200 hover:scale-[1.02]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02]"
              >
                Add Expense
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <SuccessAnimation
        show={showSuccess}
        message={successMessage}
        onComplete={() => setShowSuccess(false)}
      />
    </>
  );
};
