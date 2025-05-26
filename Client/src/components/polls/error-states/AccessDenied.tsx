import { Shield } from 'lucide-react';
import ErrorState from './ErrorState';

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ 
  message = "You don't have permission to view this form. You can only manage forms that you've created."
}: AccessDeniedProps) {
  return (
    <ErrorState
      title="Access Denied"
      message={message}
      icon={Shield}
      iconClassName="text-destructive"
    />
  );
} 