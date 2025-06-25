
import { MapPin, Calendar } from "lucide-react";

interface TripHeaderProps {
  tripName: string;
  onTripChange: (name: string) => void;
  totalAmount: number;
  expenseCount: number;
}

export const TripHeader = ({ tripName, onTripChange, totalAmount, expenseCount }: TripHeaderProps) => {
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
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
