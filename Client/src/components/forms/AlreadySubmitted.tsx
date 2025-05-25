import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlreadySubmitted() {
  const navigate = useNavigate();

  return (
    <div className="py-6">
      <div className="w-full max-w-3xl px-2 mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Already Submitted</h2>
              <p className="text-muted-foreground">
                You have already submitted your response to this form.
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