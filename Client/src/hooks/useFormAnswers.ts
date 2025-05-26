import { useState, useEffect } from 'react';
import { Form, PublicForm, DraftSubmission } from '@/lib/api';

type FormAnswers = Record<number, any>;
type ValidationErrors = Record<number, string>;

export function useFormAnswers(initialAnswers?: DraftSubmission['answers']) {
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (initialAnswers) {
      const initialAnswersMap: FormAnswers = {};
      initialAnswers.forEach(answer => {
        if (answer.text) {
          initialAnswersMap[answer.question_id] = answer.text;
        } else if (answer.option_ids) {
          initialAnswersMap[answer.question_id] = answer.option_ids;
        }
      });
      setAnswers(initialAnswersMap);
    }
  }, [initialAnswers]);

  const updateAnswer = (questionId: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear validation error when user starts typing/selecting
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = (form: Form | PublicForm): boolean => {
    if (!form) return false;
    
    const errors: ValidationErrors = {};
    let isValid = true;

    form.questions.forEach((question) => {
      const answer = answers[question.id];
      
      if (question.type === 'text') {
        if (!answer || answer.trim() === '') {
          errors[question.id] = 'This field is required';
          isValid = false;
        }
      } else {
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          errors[question.id] = 'Please select at least one option';
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const formatAnswersForSubmission = (form: Form | PublicForm) => {
    return form.questions.map((question) => {
      const answer = answers[question.id];
      
      if (question.type === 'text') {
        return {
          question_id: question.id,
          text: answer || '',
        };
      } else {
        return {
          question_id: question.id,
          option_ids: Array.isArray(answer) ? answer : [answer],
        };
      }
    });
  };

  const clearAnswers = () => {
    setAnswers({});
    setValidationErrors({});
  };

  return {
    answers,
    validationErrors,
    updateAnswer,
    validateAnswers,
    formatAnswersForSubmission,
    clearAnswers,
  };
} 