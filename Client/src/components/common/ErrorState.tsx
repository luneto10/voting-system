import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function ErrorState({
  title,
  message,
  icon,
  buttonText = "Back to My Polls",
  onButtonClick
}: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="w-full max-w-3xl px-2 mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            {icon}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button onClick={onButtonClick || (() => navigate('/polls'))}>
              {buttonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 