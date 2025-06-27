
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!checkIn || selectingCheckOut) {
      if (checkIn && date < checkIn) {
        // If selected date is before check-in, reset and use as new check-in
        onDatesChange(date, undefined);
        setSelectingCheckOut(false);
      } else {
        // Set as check-out date
        onDatesChange(checkIn, date);
        setSelectingCheckOut(false);
        setIsOpen(false);
      }
    } else {
      // Set as check-in date
      onDatesChange(date, undefined);
      setSelectingCheckOut(true);
    }
  };

  const getButtonText = () => {
    if (checkIn && checkOut) {
      return `${format(checkIn, 'MMM dd')} - ${format(checkOut, 'MMM dd')}`;
    } else if (checkIn) {
      return `${format(checkIn, 'MMM dd')} - Select checkout`;
    }
    return 'Select stay dates';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !checkIn && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getButtonText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="text-sm text-gray-600">
            {!checkIn ? 'Select check-in date' : 
             selectingCheckOut ? 'Select check-out date' : 
             'Select new dates'}
          </div>
          <Calendar
            mode="single"
            selected={selectingCheckOut ? checkOut : checkIn}
            onSelect={handleDateSelect}
            className="pointer-events-auto"
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
          {checkIn && !selectingCheckOut && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectingCheckOut(true)}
              className="w-full"
            >
              Select check-out date
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
