import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { formsApi, SaveDraftRequest } from '@/lib/api';
import { toast } from 'sonner';

export function useAutoSave(formId: number) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<SaveDraftRequest | null>(null);

  const saveDraftMutation = useMutation({
    mutationFn: (data: SaveDraftRequest) => formsApi.saveDraft(data),
    onError: (error) => {
      console.error('Failed to auto-save draft:', error);
      toast.error('Failed to auto-save your progress');
    },
  });

  const autoSave = (answers: Record<number, any>) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
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
    }, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    isSaving: saveDraftMutation.isPending,
  };
} 