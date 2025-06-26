
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelector } from "@/components/CurrencySelector";
import { formatCurrency } from "@/utils/currencyUtils";

interface CurrencyConversionProps {
  showCurrencyConversion: boolean;
  onToggle: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  originalAmount: string;
  onOriginalAmountChange: (amount: string) => void;
  originalCurrency: string;
  onOriginalCurrencyChange: (currency: string) => void;
  convertedAmount: number;
  baseCurrency: string;
}

export const CurrencyConversion = ({
  showCurrencyConversion,
  onToggle,
  amount,
  onAmountChange,
  originalAmount,
  onOriginalAmountChange,
  originalCurrency,
  onOriginalCurrencyChange,
  convertedAmount,
  baseCurrency
}: CurrencyConversionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Amount *</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
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
                onChange={(e) => onOriginalAmountChange(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Original Currency</Label>
              <CurrencySelector
                value={originalCurrency}
                onValueChange={onOriginalCurrencyChange}
                placeholder="Currency"
              />
            </div>
          </div>
          {originalAmount && originalCurrency && (
            <div className="text-sm text-gray-600">
              = {formatCurrency(convertedAmount, baseCurrency)} (converted to {baseCurrency})
            </div>
          )}
        </div>
      ) : (
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          required
        />
      )}
    </div>
  );
};
