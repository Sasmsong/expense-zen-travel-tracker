import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingCardProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
}

export const LoadingCard = ({ 
  showHeader = true, 
  lines = 3,
  className 
}: LoadingCardProps) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </CardContent>
    </Card>
  );
};