
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  checkIn?: Date;
  checkOut?: Date;
  onDatesChange: (checkIn: Date | undefined, checkOut: Date | undefined) => void;
}

export const DateRangePicker = ({ checkIn, checkOut, onDatesChange }: DateRangePickerProps) => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const handleCheckInSelect = (date: Date | undefined) => {
    onDatesChange(date, checkOut);
    setIsCheckInOpen(false);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    onDatesChange(checkIn, date);
    setIsCheckOutOpen(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Check-in Date */}
      <div>
        <label className="text-sm font-medium mb-1 block">Start Date</label>
        <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !checkIn && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, 'MMM dd') : 'Select start'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={handleCheckInSelect}
              className="pointer-events-auto"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-out Date */}
      <div>
        <label className="text-sm font-medium mb-1 block">End Date</label>
        <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !checkOut && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, 'MMM dd') : 'Select end'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={handleCheckOutSelect}
              className="pointer-events-auto"
              disabled={(date) => 
                date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                (checkIn && date <= checkIn)
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
