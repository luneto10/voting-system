import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Trash2, Calendar, Copy, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { copyToClipboard } from "@/lib/clipboard";

interface PollCardProps {
  form: Form;
  onDelete: (form: Form) => void;
}

export default function PollCard({ form, onDelete }: PollCardProps) {
  const navigate = useNavigate();

  const getStatus = () => {
    const now = new Date();
    if (form.startAt && new Date(form.startAt) > now) return 'Upcoming';
    if (form.endAt && new Date(form.endAt) < now) return 'Ended';
    return 'Active';
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/polls/${form.id}/submit`;
    await copyToClipboard(link);
  };

  return (
    <Card 
      className="border-none shadow-none bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
      onClick={() => navigate(`/polls/${form.id}`)}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{form.title}</h3>
            <div className="flex items-center gap-2 sm:gap-3 mt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <ClipboardList className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{form.questions.length} questions</span>
                <span className="sm:hidden">{form.questions.length}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">{formatDate(form.createdAt)}</span>
                <span className="sm:hidden">{new Date(form.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className="text-xs">
              {getStatus()}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
              onClick={handleCopyLink}
            >
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          <Button
              variant="ghost"
            size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(form);
            }}
          >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 