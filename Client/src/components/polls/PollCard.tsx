import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Trash2, Users, Calendar, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/polls/${form.id}/submit`;
    navigator.clipboard.writeText(link);
    toast.success('Poll link copied to clipboard');
  };

  return (
    <Card 
      className="border-none shadow-none bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
      onClick={() => navigate(`/polls/${form.id}`)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{form.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {form.questions.length} questions
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(form.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getStatus()}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(form);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 