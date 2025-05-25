import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, isValidDate } from '@/lib/utils';
import QuestionDisplay from '@/components/polls/QuestionDisplay';
import SubmissionLink from '@/components/forms/SubmissionLink';
import LoadingCard from '@/components/common/LoadingCard';

export default function PollDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getById(Number(id)),
    enabled: !!id,
    retry: false, // Don't retry on errors
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <LoadingCard message="Loading poll..." />
        </div>
      </div>
    );
  }

  // Handle 403 Forbidden error (access denied)
  if (error && (error as any)?.response?.status === 403) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <Shield className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to view this form. You can only manage forms that you've created.
                </p>
              </div>
              <Button onClick={() => navigate('/polls')}>
                Back to My Polls
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle other errors or form not found
  if (error || !form?.data) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Poll not found</h2>
                <p className="text-muted-foreground">
                  The poll you're looking for doesn't exist or has been removed.
                </p>
              </div>
              <Button onClick={() => navigate('/polls')}>
                Back to My Polls
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const poll = form.data;

  // This check is now redundant since the backend handles ownership checking
  // But keeping it as a fallback for any edge cases
  if (user && poll.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <Shield className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to view this form. You can only manage forms that you've created.
                </p>
              </div>
              <Button onClick={() => navigate('/polls')}>
                Back to My Polls
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="w-full max-w-3xl px-2 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => navigate('/polls')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
          <Button onClick={() => navigate(`/polls/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Poll
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {poll.description && (
                <p className="text-muted-foreground">{poll.description}</p>
              )}
              {(isValidDate(poll.startAt) || isValidDate(poll.endAt)) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {isValidDate(poll.startAt) && (
                    <span>From: {formatDate(poll.startAt)}</span>
                  )}
                  {isValidDate(poll.endAt) && (
                    <span>To: {formatDate(poll.endAt)}</span>
                  )}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Created: {formatDate(poll.createdAt)}
              </div>
            </CardContent>
          </Card>

          <SubmissionLink formId={poll.id} formTitle={poll.title} />

          <Card>
            <CardHeader>
              <CardTitle>Questions ({poll.questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {poll.questions.map((question, index) => (
                <QuestionDisplay 
                  key={question.id} 
                  question={question} 
                  index={index} 
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 