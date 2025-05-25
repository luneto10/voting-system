import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubmissionSuccessProps {
  formTitle: string;
  submissionTime: string;
}

export default function SubmissionSuccess({ formTitle, submissionTime }: SubmissionSuccessProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center py-6">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Submission Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Thank you for submitting your response to:
              </p>
              <p className="font-medium text-foreground">
                "{formTitle}"
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted on {new Date(submissionTime).toLocaleDateString()} at{' '}
                {new Date(submissionTime).toLocaleTimeString()}
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your response has been recorded successfully. You can close this page now.
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 