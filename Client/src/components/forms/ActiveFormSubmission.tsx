import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicForm, DraftSubmission } from '@/lib/api';
import { useFormAnswers } from '@/hooks/useFormAnswers';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useQueryClient } from '@tanstack/react-query';
import FormHeader from './FormHeader';
import QuestionRenderer from './QuestionRenderer';

interface ActiveFormSubmissionProps {
  form: PublicForm;
  onSubmit: (answers: any) => void;
  isSubmitting: boolean;
  initialAnswers?: DraftSubmission['answers'];
}

export default function ActiveFormSubmission({ 
  form, 
  onSubmit, 
  isSubmitting,
  initialAnswers
}: ActiveFormSubmissionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { answers, validationErrors, updateAnswer, validateAnswers, formatAnswersForSubmission } = useFormAnswers(initialAnswers, form.questions);
  const { autoSave, isSaving } = useAutoSave(form.id);

  const handleAnswerChange = (questionId: number, value: any) => {
    updateAnswer(questionId, value);
    autoSave(answers);
  };

  const handleSubmit = () => {
    if (!validateAnswers(form)) return;
    
    const formattedAnswers = formatAnswersForSubmission(form);
    onSubmit({ answers: formattedAnswers });
  };

  const handleCancel = () => {
    queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
    navigate('/');
  };

  return (
    <div className="py-6">
      <div className="w-full max-w-3xl px-2 mx-auto space-y-6">
        <FormHeader form={form} />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Submit Your Response</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please answer all questions below. All fields are required.
                </p>
              </div>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {form.questions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <QuestionRenderer
                      question={question}
                      value={answers[question.id]}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                      error={validationErrors[question.id]}
                    />
                  </div>
                </div>
                {index < form.questions.length - 1 && (
                  <hr className="border-muted" />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 