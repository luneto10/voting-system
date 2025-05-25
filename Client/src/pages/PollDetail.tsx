import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api';
import { formatDate, isValidDate } from '@/lib/utils';
import QuestionDisplay from '@/components/polls/QuestionDisplay';
import LoadingCard from '@/components/common/LoadingCard';

export default function PollDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getById(Number(id)),
    enabled: !!id,
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

  if (!form?.data) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <LoadingCard message="Poll not found." />
        </div>
      </div>
    );
  }

  const poll = form.data;

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
          {/* Poll Details */}
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

          {/* Questions */}
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