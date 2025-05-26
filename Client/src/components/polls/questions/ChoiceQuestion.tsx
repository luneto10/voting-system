import { FormQuestion } from '@/lib/api';
import { CheckCircle2, ListChecks } from 'lucide-react';

interface ChoiceQuestionProps {
  question: FormQuestion;
  index: number;
}

export default function ChoiceQuestion({ question, index }: ChoiceQuestionProps) {
  const getTypeIcon = () => {
    switch (question.type) {
      case 'single_choice':
        return <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />;
      case 'multiple_choice':
        return <ListChecks className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />;
      default:
        return <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />;
    }
  };

  return (
    <div className="space-y-2 p-2.5 sm:p-3 border rounded-lg bg-background/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground min-w-[1.5rem]">{index + 1}.</span>
          <h3 className="font-medium text-sm sm:text-base text-foreground">
            <span className="line-clamp-2 sm:line-clamp-none">{question.title}</span>
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary rounded-md flex items-center w-fit ml-4 sm:ml-0">
          {getTypeIcon()}
          {question.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      {question.options && question.options.length > 0 && (
        <div className="space-y-1 ml-4 sm:ml-6">
          <ul className="space-y-0.5">
            {question.options.map((option) => (
              <li key={option.id} className="text-xs sm:text-sm text-muted-foreground flex items-center">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full mr-2"></span>
                <span className="line-clamp-2">{option.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 