import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Search, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Polls', href: '/polls', icon: BarChart2 },
  { name: 'Search', href: '/search', icon: Search },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
  });

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Voting System
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <ThemeToggle />
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {isAuthenticated && navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          location.pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {user && (
                    <div className="flex items-center justify-between px-3 py-2 border-t pt-4">
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 