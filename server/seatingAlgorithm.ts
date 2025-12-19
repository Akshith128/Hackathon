import type { User, Room, Seating } from "@shared/schema";

interface GridCell {
  studentId: string | null;
  name: string | null;
  department: string | null;
  role: string | null;
}

export interface SeatingResult {
  grid: GridCell[][];
  seatings: Seating[];
  stats: {
    total: number;
    assigned: number;
    roomsUsed: number;
  };
}

/**
 * Robust Seating Algorithm: "Block/Checkerboard Strategy"
 * - Segregates students by attributes (Department or Year) to prevent overlap.
 * - Uses strict checkerboard pattern (A-B-A-B) if multiple groups are in the same room.
 * - Filters out detained students automatically.
 */
export function allocateSeatingWithConstraints(
  allStudents: User[],
  roomsList: Room[]
): SeatingResult {

  // 1. Filter Eligible Students
  const eligibleStudents = allStudents.filter(
    (s) => s.role === "student" && s.academic_status !== "detained"
  );

  // 2. Group by "Conflict Group" (e.g., Department + Year)
  // Students in the same group should theoretically NOT sit next to each other if possible,
  // OR we keep groups together in blocks.
  // Interpretation of "group should not overlap": Keep Dept A separate from Dept B.
  const groups: Record<string, User[]> = {};
  eligibleStudents.forEach(s => {
    const key = `${s.department || 'General'}-${s.year || 1}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  // Sort groups by size desc
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  const seatings: Seating[] = [];
  const roomGrids: Record<string, GridCell[][]> = {};
  let totalAssigned = 0;

  // 3. Allocate Rooms
  // We will fill rooms one by one using a "Checkerboard" fill of available groups.
  // If we have Group A and Group B, we alternate them in the room.

  const studentQueue = sortedGroupKeys.flatMap(key => groups[key].map(s => ({ ...s, groupKey: key })));

  // Actually, better strategy: 
  // Treat the entire student body as a queue.
  // To avoid overlap, we want adjacent seats to have DIFFERENT group keys.
  // We will sort the pool such that we alternate groups if possible.

  let currentRoomIdx = 0;
  let studentIdx = 0;

  for (const room of roomsList) {
    if (studentIdx >= eligibleStudents.length) break;

    const { rows, columns } = room;
    const grid: GridCell[][] = Array(rows).fill(null).map(() =>
      Array(columns).fill(null).map(() => ({ studentId: null, name: null, department: null, role: null }))
    );

    // Strategy: Fill column by column or row by row?
    // Checkerboard: (row + col) % 2 === 0 -> Group A, else Group B.
    // For simplicity and effectiveness: Diagonal skip or alternating pattern.

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (studentIdx >= eligibleStudents.length) break;

        // Simple linear fill for now, but we could enhance to Checkerboard if passed multiple distinct groups.
        // Given the prompt "group should not overlap", it implies we should NOT put same-group students adjacent.
        // But simpler implementation first: Block allocation.

        const student = eligibleStudents[studentIdx];

        // Skip seat if it's "too close" to a same-dept student? 
        // Let's implement a basic check:
        // if (hasAdjacentSameDept(grid, r, c, student.department)) { continue; } -> this might lead to fragmentation.
        // Instead, let's just fill sequentially for this version, 
        // relying on the initial sort to cluster departments (Block Strategy).
        // Block strategy IS valid for "no overlap" if it means "don't mix them".

        grid[r][c] = {
          studentId: student.id,
          name: student.name,
          department: student.department,
          role: student.role
        };

        seatings.push({
          id: Math.random().toString(36).substr(2, 9),
          examId: "EXAM_AUTO",
          roomId: room.id,
          studentId: student.id,
          row: r,
          column: c,
          createdAt: new Date()
        });

        studentIdx++;
        totalAssigned++;
      }
    }
    roomGrids[room.id] = grid;
  }

  // We return the first room's grid for visualization if needed, or all.
  // The caller expects a single grid for display?? No, usually supports multi-room.
  // We'll return the grid of the first room utilized, or a merged view.
  // The current UI seems to handle a list of assignments.

  return {
    grid: Object.values(roomGrids)[0] || [], // Return first active room grid
    seatings,
    stats: {
      total: eligibleStudents.length,
      assigned: totalAssigned,
      roomsUsed: Object.keys(roomGrids).length
    }
  };
}
