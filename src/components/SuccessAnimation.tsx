
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  message: string;
  onComplete: () => void;
}

export const SuccessAnimation = ({ show, message, onComplete }: SuccessAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full animate-pulse">
            <Check className="w-5 h-5" />
          </div>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};
