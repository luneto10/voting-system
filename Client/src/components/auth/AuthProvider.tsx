import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuth.persist.rehydrate();
  }, []);

  return <>{children}</>;
} 