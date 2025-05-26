import { FileQuestion } from 'lucide-react';
import ErrorState from './ErrorState';

interface PollNotFoundProps {
  message?: string;
}

export default function PollNotFound({ 
  message = "The poll you're looking for doesn't exist or has been removed."
}: PollNotFoundProps) {
  return (
    <ErrorState
      title="Poll not found"
      message={message}
      icon={FileQuestion}
    />
  );
} 