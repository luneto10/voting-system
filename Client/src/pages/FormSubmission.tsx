import { useParams } from 'react-router-dom';
import { useFormSubmissionState } from '@/hooks/useFormSubmissionState';
import LoadingCard from '@/components/common/LoadingCard';
import FormNotFound from '@/components/forms/FormNotFound';
import AlreadySubmitted from '@/components/forms/AlreadySubmitted';
import FormNotAvailable from '@/components/forms/FormNotAvailable';
import ActiveFormSubmission from '@/components/forms/ActiveFormSubmission';
import SubmissionSuccess from '@/components/forms/SubmissionSuccess';

export default function FormSubmission() {
  const { id } = useParams<{ id: string }>();
  
  const {
    form,
    isLoadingForm,
    isCheckingVoted,
    formError,
    hasVoted,
    submitted,
    submissionData,
    isFormAvailable,
    submitForm,
    isSubmitting,
  } = useFormSubmissionState(id);

  // Show loading state
  if (isLoadingForm || isCheckingVoted) {
    return (
      <div className="py-6">
        <div className="w-full max-w-3xl px-2 mx-auto">
          <LoadingCard message="Loading form..." />
        </div>
      </div>
    );
  }

  // Show error if form not found
  if (formError || !form) {
    return <FormNotFound />;
  }

  // Show success page if submitted
  if (submitted && submissionData) {
    return (
      <SubmissionSuccess 
        formTitle={form.title}
        submissionTime={submissionData.completed_at}
      />
    );
  }

  // Show already voted message
  if (hasVoted) {
    return <AlreadySubmitted />;
  }

  // Show form not available
  if (!isFormAvailable) {
    return <FormNotAvailable form={form} />;
  }

  // Show form submission interface
  return (
    <ActiveFormSubmission
      form={form}
      onSubmit={submitForm}
      isSubmitting={isSubmitting}
    />
  );
} 