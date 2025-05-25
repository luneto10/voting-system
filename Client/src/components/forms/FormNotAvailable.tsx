import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicForm } from '@/lib/api';
import FormHeader from './FormHeader';

interface FormNotAvailableProps {
  form: PublicForm;
}

export default function FormNotAvailable({ form }: FormNotAvailableProps) {
  const navigate = useNavigate();
  
  const now = new Date();
  const isUpcoming = form.startAt && new Date(form.startAt) > now;

  return (
    <div className="py-6">
      <div className="w-full max-w-3xl px-2 mx-auto space-y-6">
        <FormHeader form={form} />
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Clock className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">
                {isUpcoming ? 'Form Not Yet Available' : 'Form Expired'}
              </h2>
              <p className="text-muted-foreground">
                {isUpcoming 
                  ? `This form will be available starting ${new Date(form.startAt!).toLocaleDateString()}`
                  : `This form expired on ${new Date(form.endAt!).toLocaleDateString()}`
                }
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