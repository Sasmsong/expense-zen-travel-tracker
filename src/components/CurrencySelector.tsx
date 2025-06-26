
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_CURRENCIES } from "@/utils/currencyUtils";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const CurrencySelector = ({ value, onValueChange, placeholder = "Select currency" }: CurrencySelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {COMMON_CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="font-mono">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-sm text-gray-500">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
