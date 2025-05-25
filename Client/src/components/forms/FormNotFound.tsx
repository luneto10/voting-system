import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FormNotFound() {
  const navigate = useNavigate();

  return (
    <div className="py-6">
      <div className="w-full max-w-3xl px-2 mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Form Not Found</h2>
              <p className="text-muted-foreground">
                The form you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 