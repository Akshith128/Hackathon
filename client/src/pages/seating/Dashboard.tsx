import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Shuffle, Loader2, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSeatingAllocation } from '@/hooks/useSeatingAllocation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SeatingDashboard() {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const { allocateSmartSeating, getSeatingGrid } = useSeatingAllocation();
  
  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await fetch('/api/exams');
      return res.json();
    },
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms');
      return res.json();
    },
  });

  const { data: gridData, isLoading: gridLoading } = getSeatingGrid(selectedExam, selectedRoom);

  const handleAllocate = async () => {
    if (selectedExam && selectedRoom) {
      await allocateSmartSeating.mutateAsync({ examId: selectedExam, roomId: selectedRoom });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seating Allocation</h1>
          <p className="text-muted-foreground">Smart seat assignment ensuring no department clustering.</p>
        </div>
        <Button 
          onClick={handleAllocate} 
          disabled={!selectedExam || !selectedRoom || allocateSmartSeating.isPending}
          className="gap-2"
        >
          {allocateSmartSeating.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4" />
          )}
          {allocateSmartSeating.isPending ? 'Allocating...' : 'Auto-Allocate'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger disabled={examsLoading}>
                    <SelectValue placeholder={examsLoading ? "Loading exams..." : "Choose exam..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {exams && exams.length > 0 ? (
                      exams.map((exam: any) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.subjectName} ({exam.subjectCode})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-exams" disabled>No exams available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger disabled={roomsLoading}>
                    <SelectValue placeholder={roomsLoading ? "Loading rooms..." : "Choose room..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms && rooms.length > 0 ? (
                      rooms.map((room: any) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.roomNumber} (Capacity: {room.capacity})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-rooms" disabled>No rooms available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {gridData && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <p className="text-sm text-muted-foreground">Grid Size</p>
                  <p className="font-bold">{gridData.room.rows} × {gridData.room.columns}</p>
                  <p className="text-xs text-emerald-400">
                    ✓ {gridData.totalSeated} / {gridData.room.capacity} seated
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Room Visualizer */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Room Layout Visualizer</CardTitle>
              <CardDescription>
                {gridData ? `${gridData.room.roomNumber} - Click seats to view details` : 'Select exam and room to view allocation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gridLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Loading room layout...</p>
                  </div>
                </div>
              ) : gridData ? (
                <div className="space-y-4">
                  <div className="w-full aspect-video bg-black/40 rounded-xl border border-white/10 p-6 flex flex-col items-center justify-center overflow-auto">
                    <div className="absolute top-4 left-6 text-xs uppercase tracking-widest text-muted-foreground">
                      Instructor Podium
                    </div>

                    <TooltipProvider>
                      <div className="grid gap-1 md:gap-2 mt-8" style={{
                        gridTemplateColumns: `repeat(${gridData.room.columns}, minmax(0, 1fr))`,
                        width: 'fit-content',
                      }}>
                        {gridData.grid.map((row, rowIdx) =>
                          row.map((cell, colIdx) => {
                            const getDepartmentColor = (dept: string | undefined) => {
                              const colors: Record<string, string> = {
                                'Computer Science': 'bg-blue-500',
                                'Mechanical Engineering': 'bg-orange-500',
                                'Electrical Engineering': 'bg-purple-500',
                                'Civil Engineering': 'bg-green-500',
                                'Electronics': 'bg-red-500',
                              };
                              return (dept && colors[dept]) || 'bg-emerald-500';
                            };
                            
                            return (
                              <Tooltip key={`${rowIdx}-${colIdx}`}>
                                <TooltipTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    className={`w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[8px] font-mono transition-all
                                      ${!cell ? 'bg-white/10 border border-white/20 hover:bg-white/20' : `${getDepartmentColor(cell.department)} text-white shadow-lg`}
                                    `}
                                    data-testid={`seat-${rowIdx}-${colIdx}`}
                                  >
                                    {cell && cell.studentId ? cell.studentId.slice(0, 4) : '·'}
                                  </motion.button>
                                </TooltipTrigger>
                                {cell && (
                                  <TooltipContent className="bg-slate-900 text-white border-slate-700">
                                    <div className="text-sm">
                                      <p className="font-bold">{cell.studentName}</p>
                                      <p className="text-xs text-gray-300">{cell.rollNumber}</p>
                                      <p className="text-xs text-cyan-300">{cell.department}</p>
                                      <p className="text-xs text-gray-400 mt-1">Seat: {rowIdx + 1}-{colIdx + 1}</p>
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            );
                          })
                        )}
                      </div>
                    </TooltipProvider>
                  </div>

                  <div className="flex gap-2 justify-center flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>Computer Science</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>Mechanical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span>Electrical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Civil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Electronics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white/10 rounded border border-white/20"></div>
                      <span>Empty</span>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState title="No seating data" description="Select an exam and room to visualize seating allocation" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
