import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useExamMode() {
  const queryClient = useQueryClient();

  const examModeQuery = useQuery({
    queryKey: ['exam-mode'],
    queryFn: async () => {
      const response = await fetch('/api/config/exam-mode');
      if (!response.ok) throw new Error('Failed to fetch exam mode');
      const data = await response.json();
      return data.examMode as boolean;
    },
  });

  const toggleExamMode = useMutation({
    mutationFn: async (examMode: boolean) => {
      const response = await fetch('/api/config/exam-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examMode }),
      });
      if (!response.ok) throw new Error('Failed to update exam mode');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-mode'] });
    },
  });

  return {
    examMode: examModeQuery.data || false,
    isLoading: examModeQuery.isLoading,
    toggleExamMode: toggleExamMode.mutateAsync,
  };
}
