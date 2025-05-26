import { Shield } from "lucide-react";
import ErrorState from "./ErrorState";

interface AccessDeniedStateProps {
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function AccessDeniedState({
  message = "You don't have permission to view this form. You can only manage forms that you've created.",
  buttonText,
  onButtonClick
}: AccessDeniedStateProps) {
  return (
    <ErrorState
      title="Access Denied"
      message={message}
      icon={<Shield className="h-12 w-12 text-destructive" />}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
    />
  );
} 