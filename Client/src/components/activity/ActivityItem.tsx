import { CheckCircle, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ActivityItemProps {
  activity: Activity;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    default:
      return <Badge variant="outline">Available</Badge>;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'Started';
    default:
      return 'Available';
  }
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div
      key={`${activity.form_id}-${activity.completed_at || activity.last_modified}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
    >
      <div className="flex items-start sm:items-center gap-3">
        {getStatusIcon(activity.status)}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{activity.form_title}</p>
          <p className="text-sm text-muted-foreground break-words">
            {getStatusText(activity.status)}
            {activity.completed_at && ` • Completed on ${formatDate(activity.completed_at)}`}
            {activity.last_modified && !activity.completed_at && ` • Last modified on ${formatDate(activity.last_modified)}`}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {getStatusBadge(activity.status)}
      </div>
    </div>
  );
} 