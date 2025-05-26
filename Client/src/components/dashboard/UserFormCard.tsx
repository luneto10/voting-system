import { Clock, CheckCircle, Play, FileText, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardForm } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

interface UserFormCardProps {
  form: DashboardForm;
  onContinueDraft?: (formId: number) => void;
}

export default function UserFormCard({ form, onContinueDraft }: UserFormCardProps) {
  const navigate = useNavigate();

  const getStatusIcon = () => {
    switch (form.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (form.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  const handleClick = () => {
    if (form.status === 'in_progress' && onContinueDraft) {
      onContinueDraft(form.form_id);
    } else {
      navigate(`/forms/${form.form_id}/submit`);
    }
  };

  const getActionText = () => {
    switch (form.status) {
      case 'completed':
        return 'View Results';
      case 'in_progress':
        return 'Continue';
      default:
        return 'Start';
    }
  };

  const isExpired = form.endAt && new Date(form.endAt) < new Date();
  const isUpcoming = form.startAt && new Date(form.startAt) > new Date();

  return (
    <Card className={`transition-all hover:shadow-md ${isExpired ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{form.form_title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        {form.form_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {form.form_description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {form.status === 'in_progress' && form.progress_percentage !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(form.progress_percentage)}%</span>
            </div>
            <Progress value={form.progress_percentage} className="h-2" />
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          {form.startAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>
                {isUpcoming ? 'Starts' : 'Started'}: {formatDate(form.startAt)}
              </span>
            </div>
          )}
          {form.endAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className={isExpired ? 'text-red-600' : ''}>
                {isExpired ? 'Ended' : 'Ends'}: {formatDate(form.endAt)}
              </span>
            </div>
          )}
          {form.completed_at && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span>Completed: {formatDate(form.completed_at)}</span>
            </div>
          )}
          {form.last_modified && form.status === 'in_progress' && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last modified: {formatDate(form.last_modified)}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleClick}
          className="w-full"
          disabled={isExpired || isUpcoming || false}
          variant={form.status === 'completed' ? 'outline' : 'default'}
        >
          {isExpired ? 'Expired' : isUpcoming ? 'Not Started' : getActionText()}
        </Button>
      </CardContent>
    </Card>
  );
} 