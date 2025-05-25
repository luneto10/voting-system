import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/lib/api';
import { formatDate, isValidDate } from '@/lib/utils';

interface PollCardProps {
  form: Form;
  onDelete: (form: Form) => void;
}

export default function PollCard({ form, onDelete }: PollCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="w-full cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => navigate(`/polls/${form.id}`)}
    >
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">{form.title}</CardTitle>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(form);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-2">
        {form.description && (
          <p className="text-sm text-muted-foreground">
            {form.description}
          </p>
        )}
        {(isValidDate(form.startAt) || isValidDate(form.endAt)) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {isValidDate(form.startAt) && (
              <span>
                From: {formatDate(form.startAt)}
              </span>
            )}
            {isValidDate(form.endAt) && (
              <span>
                To: {formatDate(form.endAt)}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{form.questions.length} questions</span>
          <span>•</span>
          <span>
            Created: {formatDate(form.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 