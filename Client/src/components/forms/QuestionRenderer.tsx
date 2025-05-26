import { FormQuestion } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuestionRendererProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export default function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  const renderSingleChoice = () => (
    <RadioGroup
      value={value && value.length > 0 ? value[0].toString() : ''}
      onValueChange={(newValue) => onChange([parseInt(newValue)])}
      className="space-y-3"
    >
      {question.options?.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
          <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
            {option.title}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`option-${option.id}`}
            checked={Array.isArray(value) ? value.includes(option.id) : false}
            onCheckedChange={(checked) => {
              const currentValue = Array.isArray(value) ? value : [];
              if (checked) {
                onChange([...currentValue, option.id]);
              } else {
                onChange(currentValue.filter((id: number) => id !== option.id));
              }
            }}
          />
          <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
            {option.title}
          </Label>
        </div>
      ))}
    </div>
  );

  const renderTextInput = () => (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your response..."
      className="min-h-[100px] resize-none"
    />
  );

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{question.title}</Label>
      
      {question.type === 'single_choice' && renderSingleChoice()}
      {question.type === 'multiple_choice' && renderMultipleChoice()}
      {question.type === 'text' && renderTextInput()}
      
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
} 