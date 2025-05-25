import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserVoteCheckerProps {
  formId: number;
}

export default function UserVoteChecker({ formId }: UserVoteCheckerProps) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ email: string; hasVoted: boolean } | null>(null);

  const checkVoteMutation = useMutation({
    mutationFn: (email: string) => formsApi.hasVoted(formId, email),
    onSuccess: (response, email) => {
      setResult({ email, hasVoted: response.data.submitted });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check vote status');
    },
  });

  const handleCheck = () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    checkVoteMutation.mutate(email.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Check User Vote Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter user email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleCheck}
            disabled={checkVoteMutation.isPending}
          >
            {checkVoteMutation.isPending ? 'Checking...' : 'Check'}
          </Button>
        </div>

        {result && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              {result.hasVoted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{result.email}</p>
                <p className="text-sm text-muted-foreground">
                  {result.hasVoted ? 'Has voted in this form' : 'Has not voted in this form'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 