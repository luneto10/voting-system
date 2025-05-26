import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { formsApi, SaveDraftRequest } from '@/lib/api';
import { toast } from 'sonner';

export function useAutoSave(formId: number) {
  const lastSavedRef = useRef<SaveDraftRequest | null>(null);
  const currentAnswersRef = useRef<Record<number, any>>({});

  const saveDraftMutation = useMutation({
    mutationFn: (data: SaveDraftRequest) => formsApi.saveDraft(data),
    onError: (error) => {
      console.error('Failed to auto-save draft:', error);
      toast.error('Failed to auto-save your progress');
    },
  });

  const formatAndSaveDraft = (answers: Record<number, any>) => {
    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
      if (Array.isArray(value)) {
        return {
          question_id: parseInt(questionId),
          option_ids: value,
        };
      }
      return {
        question_id: parseInt(questionId),
        text: value,
      };
    });

    const draftData: SaveDraftRequest = {
      form_id: formId,
      answers: formattedAnswers,
    };

    // Only save if the data has changed
    if (JSON.stringify(draftData) !== JSON.stringify(lastSavedRef.current)) {
      saveDraftMutation.mutate(draftData);
      lastSavedRef.current = draftData;
    }
  };

  const autoSave = (answers: Record<number, any>) => {
    // Store current answers
    currentAnswersRef.current = answers;
    // Save immediately
    formatAndSaveDraft(answers);
  };

  // Save when component unmounts (e.g., returning to dashboard)
  useEffect(() => {
    return () => {
      if (Object.keys(currentAnswersRef.current).length > 0) {
        formatAndSaveDraft(currentAnswersRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    isSaving: saveDraftMutation.isPending,
  };
} 