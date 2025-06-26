
import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onVoiceResult: (result: { merchant: string; amount: string; category?: string }) => void;
}

export const VoiceInput = ({ onVoiceResult }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = 'en-US';

    recognition.current.onstart = () => {
      setIsListening(true);
    };

    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice input:', transcript);
      
      // Parse the voice input for merchant, amount, and category
      const parseVoiceInput = (text: string) => {
        // Look for amount patterns like "4 dollars", "$20", "twenty dollars"
        const amountPatterns = [
          /(\d+\.?\d*)\s*dollars?/i,
          /\$(\d+\.?\d*)/i,
          /(\d+\.?\d*)\s*bucks?/i
        ];
        
        let amount = '';
        let cleanText = text;
        
        for (const pattern of amountPatterns) {
          const match = text.match(pattern);
          if (match) {
            amount = match[1];
            cleanText = text.replace(match[0], '').trim();
            break;
          }
        }
        
        // Extract merchant name (remaining text after removing amount)
        const merchant = cleanText.replace(/\b(at|from|for)\b/gi, '').trim();
        
        // Try to detect category from common keywords
        let category = '';
        if (text.includes('coffee') || text.includes('starbucks')) category = 'Coffee';
        else if (text.includes('food') || text.includes('restaurant') || text.includes('lunch') || text.includes('dinner')) category = 'Food';
        else if (text.includes('hotel') || text.includes('accommodation')) category = 'Hotel';
        else if (text.includes('taxi') || text.includes('uber') || text.includes('transport')) category = 'Transportation';
        
        return { merchant: merchant || 'Voice Entry', amount, category };
      };

      const result = parseVoiceInput(transcript);
      onVoiceResult(result);
      
      toast({
        title: "Voice input captured",
        description: `"${transcript}"`,
      });
    };

    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Voice input error",
        description: "Could not capture voice input. Please try again.",
        variant: "destructive"
      });
    };

    recognition.current.onend = () => {
      setIsListening(false);
    };

    recognition.current.start();
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={`transition-all duration-200 ${isListening ? 'animate-pulse' : ''}`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      {isListening ? 'Stop' : 'Voice'}
    </Button>
  );
};
