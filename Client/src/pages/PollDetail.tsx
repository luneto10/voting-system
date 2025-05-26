import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, ClipboardList } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, isValidDate } from '@/lib/utils';
import QuestionDisplay from '@/components/polls/QuestionDisplay';
import SubmissionLink from '@/components/forms/SubmissionLink';
import LoadingCard from '@/components/common/LoadingCard';
import AccessDenied from '@/components/polls/error-states/AccessDenied';
import PollNotFound from '@/components/polls/error-states/PollNotFound';

export default function PollDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getById(Number(id)),
    enabled: !!id,
    retry: false,
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
    return <AccessDenied />;
  }

  // Handle other errors or form not found
  if (error || !form?.data) {
    return <PollNotFound />;
  }

  const poll = form.data;

  if (user && poll.user_id !== user.id) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background py-3 sm:py-6">
      <div className="w-full max-w-3xl px-2 sm:px-4 mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/polls')} className="h-8 sm:h-9">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Back to Polls</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button size="sm" onClick={() => navigate(`/polls/${id}/edit`)} className="h-8 sm:h-9">
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Edit Poll</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>

        <div className="space-y-2.5 sm:space-y-4">
          <Card className="border-none shadow-none bg-muted/50">
            <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
              <CardTitle className="text-lg sm:text-2xl text-foreground line-clamp-2 sm:line-clamp-none">
                {poll.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
              {poll.description && (
                <p className="text-xs sm:text-base text-muted-foreground line-clamp-3 sm:line-clamp-none">
                  {poll.description}
                </p>
              )}
              {(isValidDate(poll.startAt) || isValidDate(poll.endAt)) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs text-muted-foreground">
                  {isValidDate(poll.startAt) && (
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
                      From: {formatDate(poll.startAt)}
                    </span>
                  )}
                  {isValidDate(poll.endAt) && (
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
                      To: {formatDate(poll.endAt)}
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
                Created: {formatDate(poll.createdAt)}
              </div>
            </CardContent>
          </Card>

          <SubmissionLink formId={poll.id} formTitle={poll.title} />

          <Card className="border-none shadow-none bg-muted/50">
            <CardHeader className="px-3 py-2.5 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Questions ({poll.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
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