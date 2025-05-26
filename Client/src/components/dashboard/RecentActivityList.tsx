import { CheckCircle, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardActivity } from "@/lib/api";

interface RecentActivityListProps {
  activities: DashboardActivity[];
}

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
            ) : (
              <FileText className="h-4 w-4 text-gray-600" />
            )}
            <div>
              <p className="font-medium">{activity.form_title}</p>
              <p className="text-sm text-muted-foreground">
                {activity.status === 'completed' ? 'Completed' : 
                 activity.status === 'in_progress' ? 'Started' : 'Available'}
              </p>
            </div>
          </div>
          <Badge variant={
            activity.status === 'completed' ? 'default' :
            activity.status === 'in_progress' ? 'secondary' : 'outline'
          }>
            {activity.status === 'completed' ? 'Done' : 
             activity.status === 'in_progress' ? 'Draft' : 'New'}
          </Badge>
        </div>
      ))}
    </div>
  );
} 