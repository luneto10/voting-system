import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, SubmitFormRequest, DraftSubmission } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

export function useFormSubmissionState(formId: string | undefined) {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Get draft data from location state if available
  const draftData = location.state?.draftData as DraftSubmission | undefined;

  // Fetch form data (public endpoint for submission)
  const { data: formResponse, isLoading: isLoadingForm, error: formError } = useQuery({
    queryKey: ['publicForm', formId],
    queryFn: () => formsApi.getPublicById(Number(formId)),
    enabled: !!formId,
  });

  // Check if user has already voted
  const { data: hasVotedResponse, isLoading: isCheckingVoted } = useQuery({
    queryKey: ['hasVoted', formId, user?.email],
    queryFn: () => formsApi.hasVoted(Number(formId), user?.email || ''),
    enabled: !!formId && !!user?.email,
  });

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: (data: SubmitFormRequest) => formsApi.submit(Number(formId), data),
    onSuccess: (response) => {
      setSubmissionData(response.data);
      setSubmitted(true);
      toast.success('Form submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit form');
    },
  });

  const form = formResponse?.data;

  // Check if form is available for submission
  const isFormAvailable = () => {
    if (!form) return false;
    
    const now = new Date();
    if (form.startAt && new Date(form.startAt) > now) return false;
    if (form.endAt && new Date(form.endAt) < now) return false;
    return true;
  };

  const submitForm = (answers: SubmitFormRequest) => {
    submitMutation.mutate(answers);
  };

  // Ensure draftAnswers is properly formatted
  const draftAnswers = draftData?.answers?.map(answer => ({
    question_id: answer.question_id,
    option_ids: answer.option_ids || [],
    text: answer.text || '',
  }));

  return {
    form,
    isLoadingForm,
    isCheckingVoted,
    formError,
    hasVoted: hasVotedResponse?.data.submitted,
    submitted,
    submissionData,
    isFormAvailable: isFormAvailable(),
    submitForm,
    isSubmitting: submitMutation.isPending,
    draftAnswers,
  };
}
