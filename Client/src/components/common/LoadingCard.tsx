import { Card, CardContent } from '@/components/ui/card';

interface LoadingCardProps {
  message?: string;
}

export default function LoadingCard({ message = "Loading..." }: LoadingCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
} 