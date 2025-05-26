import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title: string;
  message: string;
  icon: LucideIcon;
  iconClassName?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function ErrorState({ 
  title,
  message,
  icon: Icon,
  iconClassName = "text-muted-foreground",
  buttonText = "Back to My Polls",
  onButtonClick
}: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-3 sm:py-6">
      <div className="w-full max-w-3xl px-2 sm:px-4 mx-auto">
        <Card className="border-none shadow-none bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
            <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${iconClassName}`} />
            <div className="text-center space-y-1.5 sm:space-y-2">
              <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            <Button 
              onClick={onButtonClick || (() => navigate('/polls'))} 
              size="sm" 
              className="h-8 sm:h-9"
            >
              {buttonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 