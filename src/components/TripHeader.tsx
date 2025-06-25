
import { MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TripHeaderProps {
  tripName: string;
  onTripChange: (name: string) => void;
  totalAmount: number;
  expenseCount: number;
}

export const TripHeader = ({ tripName, onTripChange, totalAmount, expenseCount }: TripHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5" />
        <Input
          value={tripName}
          onChange={(e) => onTripChange(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 font-medium"
          placeholder="Trip name..."
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div>
          {expenseCount} expenses • ${totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
