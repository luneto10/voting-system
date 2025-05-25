import { FormQuestion } from '@/lib/api';

interface QuestionDisplayProps {
  question: FormQuestion;
  index: number;
}

export default function QuestionDisplay({ question, index }: QuestionDisplayProps) {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          {index + 1}. {question.title}
        </h3>
        <span className="text-xs px-2 py-1 bg-secondary rounded-md">
          {question.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      {question.type !== 'text' && question.options && question.options.length > 0 && (
        <div className="space-y-2 ml-4">
          <p className="text-sm font-medium text-muted-foreground">Options:</p>
          <ul className="space-y-1">
            {question.options.map((option) => (
              <li key={option.id} className="text-sm text-muted-foreground flex items-center">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></span>
                {option.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {question.type === 'text' && (
        <p className="text-sm text-muted-foreground ml-4">
          Open text response
        </p>
      )}
    </div>
  );
} 