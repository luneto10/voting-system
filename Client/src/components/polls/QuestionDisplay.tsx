import { FormQuestion } from '@/lib/api';
import TextQuestion from './questions/TextQuestion';
import ChoiceQuestion from './questions/ChoiceQuestion';

interface QuestionDisplayProps {
  question: FormQuestion;
  index: number;
}

export default function QuestionDisplay({ question, index }: QuestionDisplayProps) {
  if (question.type === 'text') {
    return <TextQuestion title={question.title} index={index} />;
  }

  return <ChoiceQuestion question={question} index={index} />;
} 