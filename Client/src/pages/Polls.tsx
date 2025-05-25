import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, Form } from '@/lib/api';
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
import PollCard from '@/components/polls/PollCard';
import LoadingCard from '@/components/common/LoadingCard';
import EmptyState from '@/components/common/EmptyState';

export default function Polls() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: formsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: formsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Poll deleted successfully');
      setFormToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete poll');
    },
  });

  const handleDelete = (form: Form) => {
    setFormToDelete(form);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete.id);
    }
  };

  return (
    <div className="bg-background py-6 overflow-x-hidden">
      <div className="w-full max-w-3xl px-2 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Polls</h1>
          <Button onClick={() => navigate('/polls/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingCard message="Loading polls..." />
          ) : forms?.data.length === 0 ? (
            <EmptyState message="No polls available. Create your first poll to get started." />
          ) : (
            forms?.data.map((form) => (
              <PollCard 
                key={form.id} 
                form={form} 
                onDelete={handleDelete} 
              />
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!formToDelete} onOpenChange={() => setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poll
              "{formToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
