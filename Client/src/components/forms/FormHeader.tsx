import { Form, PublicForm } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, isValidDate } from '@/lib/utils';
import { Calendar, Clock, FileText } from 'lucide-react';

interface FormHeaderProps {
  form: Form | PublicForm;
}

export default function FormHeader({ form }: FormHeaderProps) {

  const getStatus = () => {
    const now = new Date();
    if (isValidDate(form.startAt) && form.startAt && new Date(form.startAt) > now) {
      return { status: 'upcoming', text: 'Upcoming', color: 'text-yellow-600' };
    }
    if (isValidDate(form.endAt) && form.endAt && new Date(form.endAt) < now) {
      return { status: 'expired', text: 'Expired', color: 'text-red-600' };
    }
    return { status: 'active', text: 'Active', color: 'text-green-600' };
  };

  const status = getStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted ${status.color}`}>
                <div className={`w-2 h-2 rounded-full ${status.status === 'active' ? 'bg-green-500' : status.status === 'upcoming' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                {status.text}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {form.questions.length} questions
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {(form.description || isValidDate(form.startAt) || isValidDate(form.endAt)) && (
        <CardContent className="space-y-4">
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
          
          {(isValidDate(form.startAt) || isValidDate(form.endAt)) && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {isValidDate(form.startAt) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Starts: {formatDate(form.startAt)}</span>
                </div>
              )}
              {isValidDate(form.endAt) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Ends: {formatDate(form.endAt)}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 