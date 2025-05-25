import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import RootLayout from '@/layouts/RootLayout';
import Dashboard from '@/pages/Dashboard';
import Polls from '@/pages/Polls';
import CreatePoll from '@/pages/CreatePoll';
import PollDetail from '@/pages/PollDetail';
import Search from '@/pages/Search';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { ThemeProvider } from '@/components/theme/theme-provider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/components/auth/AuthProvider';
import { queryClient } from '@/lib/query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="voting-system-theme">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <RootLayout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="polls" element={<Polls />} />
                        <Route path="polls/create" element={<CreatePoll />} />
                        <Route path="polls/:id" element={<PollDetail />} />
                        <Route path="search" element={<Search />} />
                      </Routes>
                    </RootLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
