import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOfflineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <Alert className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-md ${
      isOnline ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
    }`}>
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-600" />
      ) : (
        <WifiOff className="h-4 w-4 text-yellow-600" />
      )}
      <AlertDescription className={isOnline ? 'text-green-800' : 'text-yellow-800'}>
        {isOnline 
          ? "You're back online! Data will sync automatically." 
          : "You're offline. Changes will be saved locally and synced when you reconnect."
        }
      </AlertDescription>
    </Alert>
  );
};