import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Seating } from '@shared/schema';

export function useSeating() {
  const queryClient = useQueryClient();

  const allocateSeating = useMutation({
    mutationFn: async (params: { examId: string; room: string; totalSeats: number; rows: number; cols: number }) => {
      const response = await fetch('/api/seatings/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to allocate seating');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatings'] });
    },
  });

  const getSeatingsForExam = (examId: string) => useQuery({
    queryKey: ['seatings', 'exam', examId],
    queryFn: async () => {
      const response = await fetch(`/api/seatings/exam/${examId}`);
      if (!response.ok) throw new Error('Failed to fetch seatings');
      return response.json() as Promise<Seating[]>;
    },
    enabled: !!examId,
  });

  return {
    allocateSeating,
    getSeatingsForExam,
  };
}
