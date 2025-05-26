import { CheckCircle, Clock, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardActivity } from "@/lib/api";

interface RecentActivityListProps {
  activities: DashboardActivity[];
}

const getBadgeProps = (status: string) => {
  switch (status) {
    case 'completed':
      return { variant: 'default' as const, text: 'Done' };
    case 'in_progress':
      return { variant: 'secondary' as const, text: 'Draft' };
    case 'deleted':
      return { variant: 'destructive' as const, text: 'Deleted' };
    default:
      return { variant: 'outline' as const, text: 'New' };
  }
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity, index) => (
        <div key={`${activity.form_id}-${index}`} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {activity.status === 'completed' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : activity.status === 'in_progress' ? (
              <Clock className="h-4 w-4 text-blue-600" />
            ) : activity.status === 'deleted' ? (
              <Trash2 className="h-4 w-4 text-red-600" />
            ) : (
              <FileText className="h-4 w-4 text-gray-600" />
            )}
            <div>
              <p className="font-medium">{activity.form_title}</p>
              <p className="text-sm text-muted-foreground">
                {activity.status === 'completed' ? 'Completed' : 
                 activity.status === 'in_progress' ? 'Started' : 
                 activity.status === 'deleted' ? 'Poll was deleted by the owner' : 'Unknown'}
              </p>
            </div>
          </div>
          <Badge variant={getBadgeProps(activity.status).variant}>
            {getBadgeProps(activity.status).text}
          </Badge>
        </div>
      ))}
    </div>
  );
} 