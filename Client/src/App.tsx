import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import RootLayout from '@/layouts/RootLayout';
import Dashboard from '@/pages/Dashboard';
import Polls from '@/pages/Polls';
import Search from '@/pages/Search';
import Login from '@/pages/Login';
import { ThemeProvider } from '@/components/theme/theme-provider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="voting-system-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RootLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="polls" element={<Polls />} />
                      <Route path="search" element={<Search />} />
                    </Routes>
                  </RootLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
