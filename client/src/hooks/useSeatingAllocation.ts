import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface GridCell {
  studentId: string | null;
  studentName?: string;
  rollNumber?: string;
  department?: string;
}

interface SeatingGridResponse {
  room: {
    id: string;
    roomNumber: string;
    rows: number;
    columns: number;
    capacity: number;
  };
  grid: (GridCell | null)[][];
  totalSeated: number;
}

export function useSeatingAllocation() {
  const queryClient = useQueryClient();

  const allocateSmartSeating = useMutation({
    mutationFn: async (params: { examId: string; roomId: string }) => {
      const response = await fetch('/api/seatings/allocate-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to allocate seating');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seating-grid', variables.examId, variables.roomId] });
    },
  });

  const getSeatingGrid = (examId: string, roomId: string) => useQuery({
    queryKey: ['seating-grid', examId, roomId],
    queryFn: async () => {
      const response = await fetch(`/api/seatings/grid/${examId}/${roomId}`);
      if (!response.ok) throw new Error('Failed to fetch seating grid');
      return response.json() as Promise<SeatingGridResponse>;
    },
    enabled: !!examId && !!roomId,
  });

  return {
    allocateSmartSeating,
    getSeatingGrid,
  };
}
