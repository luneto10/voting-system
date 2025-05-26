import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface SubmissionProtectedRouteProps {
  children: React.ReactNode;
}

export default function SubmissionProtectedRoute({ children }: SubmissionProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, returnToSubmission: true }} replace />;
  }

  return <>{children}</>;
} 