import { useState, useEffect } from 'react';
import { Search, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { formsApi, PublicForm } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function DashboardSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-forms', searchQuery],
    queryFn: () => formsApi.searchForms(searchQuery),
    enabled: searchQuery.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSelectForm = (formId: number) => {
    navigate(`/polls/${formId}`);
    setOpen(false);
    setSearchQuery('');
  };

  const getFormStatus = (form: PublicForm) => {
    const now = new Date();
    const startDate = form.startAt ? new Date(form.startAt) : null;
    const endDate = form.endAt ? new Date(form.endAt) : null;

    if (endDate && now > endDate) {
      return { status: 'Closed', variant: 'secondary' as const };
    }
    if (startDate && now < startDate) {
      return { status: 'Upcoming', variant: 'outline' as const };
    }
    return { status: 'Active', variant: 'default' as const };
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forms... (Ctrl+K)"
          className="pl-8 cursor-pointer"
          onClick={() => setOpen(true)}
          readOnly
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 text-xs text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          ⌘K
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search forms..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? 'Searching...' : 'No forms found.'}
          </CommandEmpty>
          {searchResults?.data && searchResults.data.length > 0 && (
            <CommandGroup heading="Forms">
              {searchResults.data.map((form) => {
                const { status, variant } = getFormStatus(form);
                return (
                  <CommandItem
                    key={form.id}
                    onSelect={() => handleSelectForm(form.id)}
                    className="flex items-center gap-3 p-3"
                  >
                    <FileText className="h-4 w-4" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{form.title}</span>
                        <Badge variant={variant}>{status}</Badge>
                      </div>
                      {form.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {form.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{form.questions.length} questions</span>
                        {form.endAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ends: {new Date(form.endAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
} 