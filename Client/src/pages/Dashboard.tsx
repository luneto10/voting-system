import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formsApi, DashboardData, DashboardForm, ApiResponse } from '@/lib/api';
import { Clock, CheckCircle, Activity } from 'lucide-react';
import UserFormCard from '@/components/dashboard/UserFormCard';
import LoadingCard from '@/components/common/LoadingCard';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading, error } = useQuery<ApiResponse<DashboardData>>({
    queryKey: ['user-dashboard'],
    queryFn: formsApi.getUserDashboard,
    staleTime: 2 * 60 * 1000,
  });

  const continueDraftMutation = useMutation({
    mutationFn: async (formId: number) => {
      const draft = await formsApi.getDraft(formId);
      return { formId, draft };
    },
    onSuccess: ({ formId, draft }) => {
      navigate(`/forms/${formId}/submit`, { 
        state: { draftData: draft.data } 
      });
    },
    onError: (_, formId) => {
      toast.error('Failed to load draft. Starting form from beginning.');
      navigate(`/forms/${formId}/submit`);
    },
  });

  const handleContinueDraft = (formId: number) => {
    continueDraftMutation.mutate(formId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LoadingCard message="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="p-6">
            <EmptyState 
              message="Failed to load dashboard data. Please try again." 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultData: DashboardData = {
    statistics: {
      total_available: 0,
      total_completed: 0,
      total_in_progress: 0,
      recent_activity_count: 0
    },
    recent_activity: [],
    forms: []
  };

  const { statistics = defaultData.statistics, recent_activity = [], forms = [] } = dashboardData?.data || defaultData;

  const inProgressForms = forms.filter((f: DashboardForm) => f.status === 'in_progress');
  const completedForms = forms.filter((f: DashboardForm) => f.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/polls')} variant="outline">
          Browse All Forms
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_in_progress ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Continue where you left off
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_completed ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Forms you've finished
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.recent_activity_count ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Actions this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/activity">View All</Link>
          </Button>
        </div>
        <RecentActivityList activities={recent_activity} />
      </div>

      {/* Forms organized by status */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Progress ({inProgressForms.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedForms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressForms.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState 
                  message="No forms in progress. Start a new form to see it here!" 
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressForms.map((form: DashboardForm) => (
                <UserFormCard 
                  key={form.form_id} 
                  form={form} 
                  onContinueDraft={handleContinueDraft}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedForms.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState 
                  message="No completed forms yet. Complete a form to see your results here!" 
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedForms.map((form: DashboardForm) => (
                <UserFormCard key={form.form_id} form={form} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 