import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
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
import { useState, useMemo } from 'react';
import PollCard from '@/components/polls/PollCard';
import LoadingCard from '@/components/common/LoadingCard';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ITEMS_PER_PAGE = 5;

export default function Polls() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredForms = useMemo(() => {
    if (!forms?.data) return [];
    if (!searchQuery) return forms.data;
    
    return forms.data.filter(form => 
      form.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [forms?.data, searchQuery]);

  const sortedForms = useMemo(() => {
    return [...filteredForms].sort((a, b) => {
      const dateA = a.startAt ? new Date(a.startAt).getTime() : 0;
      const dateB = b.startAt ? new Date(b.startAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredForms]);

  const totalPages = Math.ceil(sortedForms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentForms = sortedForms.slice(startIndex, endIndex);

  return (
    <div className="bg-background py-4">
      <div className="w-full max-w-2xl px-2 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Polls</h1>
          <div className="flex items-center gap-2">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[200px] justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {searchQuery ? searchQuery : "Search polls..."}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search polls..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No polls found.</CommandEmpty>
                    <CommandGroup>
                      {forms?.data.map((form) => (
                        <CommandItem
                          key={form.id}
                          onSelect={() => {
                            setSearchQuery(form.title);
                            setSearchOpen(false);
                          }}
                        >
                          {form.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => navigate('/polls/create')}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <LoadingCard message="Loading polls..." />
          ) : filteredForms.length === 0 ? (
            <EmptyState message="No polls available. Create your first poll to get started." />
          ) : (
            <>
              {currentForms.map((form) => (
                <PollCard 
                  key={form.id} 
                  form={form} 
                  onDelete={handleDelete} 
                />
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
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
