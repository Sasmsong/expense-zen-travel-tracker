import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
}

export const useRetry = <T>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    onError,
    onSuccess
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setAttempt(0);

    for (let i = 0; i < maxAttempts; i++) {
      try {
        setAttempt(i + 1);
        const result = await operation();
        setIsLoading(false);
        onSuccess?.();
        return result;
      } catch (err) {
        const error = err as Error;
        
        if (i === maxAttempts - 1) {
          // Final attempt failed
          setError(error);
          setIsLoading(false);
          onError?.(error, i + 1);
          
          toast({
            title: "Operation Failed",
            description: `Failed after ${maxAttempts} attempts: ${error.message}`,
            variant: "destructive"
          });
          
          return null;
        }

        // Wait before retrying
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    return null;
  }, [operation, maxAttempts, delay, onError, onSuccess]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    execute,
    retry,
    isLoading,
    error,
    attempt
  };
};