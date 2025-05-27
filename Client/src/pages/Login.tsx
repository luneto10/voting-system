import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { authApi, User } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.data && response.data.user) {
        const user: User = response.data.user;
        setUser(user);
        toast.success('Login successful');
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        const from = location.state?.from;
        if (from?.pathname && from.pathname.includes('/forms/') && from.pathname.includes('/submit')) {
          navigate(from.pathname, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Invalid response from server');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid email or password');
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    const refreshToken = localStorage.getItem('refresh_token');
    loginMutation.mutate({
      ...values,
      refresh_token: refreshToken || undefined,
    });
  }

  // Check if this is a submission redirect
  const isSubmissionRedirect = location.state?.from?.pathname?.includes('/forms/') && location.state?.from?.pathname?.includes('/submit');

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            {isSubmissionRedirect 
              ? 'Please login to submit your response to the form'
              : 'Enter your credentials to login'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 