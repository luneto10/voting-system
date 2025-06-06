import { Clock, CheckCircle, Play, FileText, Calendar, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardForm } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface UserFormCardProps {
  form: DashboardForm;
  onContinueDraft?: (formId: number) => void;
}

export default function UserFormCard({ form, onContinueDraft }: UserFormCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => formsApi.deleteFormParticipation(form.form_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      toast.success('Form removed from in-progress list');
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error('Failed to remove form');
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

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
      navigate(`/polls/${form.form_id}/submit`);
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
    <>
    <Card className={`transition-all hover:shadow-md ${isExpired ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{form.form_title}</CardTitle>
          </div>
            <div className="flex items-center gap-2">
          {getStatusBadge()}
              {form.status === 'in_progress' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
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

        {form.status != 'completed' && <Button 
          onClick={handleClick}
          className="w-full"
          disabled={isExpired || isUpcoming || false}
          variant='default'
        >
          {isExpired ? 'Expired' : isUpcoming ? 'Not Started' : getActionText()}
        </Button>}
      </CardContent>
    </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Form from In Progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{form.form_title}" from your in-progress list. You can always start the form again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 