
import { useState } from 'react';
import { X, Camera, Mic, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingGuide = ({ isOpen, onClose }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Expense Zen!",
      description: "Track your travel expenses effortlessly with smart features and beautiful insights.",
      icon: <Camera className="w-12 h-12 text-blue-500" />,
      tip: "Start by creating your first trip"
    },
    {
      title: "Quick Expense Logging",
      description: "Take photos of receipts or use voice input to log expenses instantly.",
      icon: <Mic className="w-12 h-12 text-green-500" />,
      tip: "Say 'Coffee 4 dollars' to quickly log an expense"
    },
    {
      title: "Smart Analytics",
      description: "View spending breakdowns, maps, and insights to stay on budget.",
      icon: <MapPin className="w-12 h-12 text-purple-500" />,
      tip: "Swipe left on expenses to delete them"
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center animate-fade-in">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                💡 Tip: {steps[currentStep].tip}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
