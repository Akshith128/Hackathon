import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, AlertCircle, Check, GripVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/hooks/useEvents';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/EmptyState';

export default function ClubDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("04:00 PM");
  const [venue, setVenue] = useState("");
  const [conflict, setConflict] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { events, isLoading, createEvent, updateEventStatus } = useEvents();

  // Fetch exams to check for conflicts
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await fetch('/api/exams');
      return res.json();
    },
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    checkConflicts(newDate);
  };

  const checkConflicts = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setConflict(false);
      return;
    }

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const hasConflict = exams.some((exam: any) => exam.examDate === selectedDateStr);

    if (hasConflict) {
      setConflict(true);
      toast({
        title: "Conflict Detected",
        description: "An exam is scheduled on this date. Event approval may be affected.",
        variant: "destructive",
      });
    } else {
      setConflict(false);
    }
  };

  const addEvent = async () => {
     if (date && eventTitle && venue && startTime && endTime) {
       try {
         await createEvent.mutateAsync({
           title: eventTitle,
           description: "",
           eventDate: format(date, 'yyyy-MM-dd'),
           startTime: startTime,
           endTime: endTime,
           venue: venue,
           department: "Club",
           status: "pending",
           createdBy: null,
         });
         toast({
           title: "Event Submitted",
           description: "New event proposal added to pending list for admin approval.",
         });
         setDialogOpen(false);
         setEventTitle("");
         setStartTime("10:00 AM");
         setEndTime("04:00 PM");
         setVenue("");
       } catch (error) {
         toast({
           title: "Error",
           description: "Failed to create event.",
           variant: "destructive",
         });
       }
     } else {
       toast({
         title: "Missing Fields",
         description: "Please fill in all required fields.",
         variant: "destructive",
       });
     }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const destStatus = destination.droppableId;

    try {
      await updateEventStatus.mutateAsync({ id: draggableId, status: destStatus });
      toast({
        title: "Status Updated",
        description: `Event moved to ${destStatus}.`,
        className: destStatus === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Club Events</h1>
          <p className="text-muted-foreground">Coordinate and approve campus activities.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-new-event"><Plus className="w-4 h-4" /> New Event Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Event Proposal</DialogTitle>
              <DialogDescription>
                Check for conflicts before submitting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Event Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Tech Fest 2025"
                  value={eventTitle} 
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="col-span-3" 
                  data-testid="input-event-name"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        data-testid="button-date-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="text-right">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time"
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="col-span-3" 
                  data-testid="input-start-time"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="text-right">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time"
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="col-span-3" 
                  data-testid="input-end-time"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">Venue</Label>
                <Input 
                  id="venue" 
                  placeholder="e.g., Main Auditorium"
                  value={venue} 
                  onChange={(e) => setVenue(e.target.value)}
                  className="col-span-3" 
                  data-testid="input-venue"
                />
              </div>
              
              {/* CONFLICT CHECKER UI */}
              <div className="col-span-4">
                {conflict ? (
                  <div className="rounded-md bg-red-500/10 p-3 border border-red-500/20 flex items-start gap-3 animate-in slide-in-from-top-2" data-testid="alert-exam-conflict">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-500">Conflict: Exam scheduled on this date.</p>
                      <p className="text-xs text-red-400">Please choose a different date for your event.</p>
                    </div>
                  </div>
                ) : date ? (
                   <div className="rounded-md bg-emerald-500/10 p-3 border border-emerald-500/20 flex items-start gap-3 animate-in slide-in-from-top-2" data-testid="alert-no-conflict">
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-500">Date Available</p>
                      <p className="text-xs text-emerald-400">No exam conflicts. Event will go to admin for approval.</p>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>
            <DialogFooter>
              <Button type="submit" disabled={conflict || createEvent.isPending} onClick={addEvent} className="gap-2">
                {createEvent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Proposal'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {['pending', 'approved', 'rejected'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col h-full bg-white/5 rounded-xl border transition-colors overflow-hidden
                    ${snapshot.isDraggingOver ? 'border-primary/50 bg-white/10' : 'border-white/5'}
                  `}
                >
                  <div className={`p-4 border-b border-white/5 font-medium uppercase text-xs tracking-wider flex justify-between items-center
                    ${status === 'pending' ? 'text-orange-400 bg-orange-500/5' : ''}
                    ${status === 'approved' ? 'text-emerald-400 bg-emerald-500/5' : ''}
                    ${status === 'rejected' ? 'text-red-400 bg-red-500/5' : ''}
                  `}>
                    {status}
                    <Badge variant="outline" className="bg-transparent border-white/10 text-inherit">
                      {events.filter(e => e.status === status).length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[100px]">
                    {events.filter(e => e.status === status).length === 0 ? (
                      <EmptyState title="No events" description={`No ${status} events at the moment`} />
                    ) : (
                      events.filter(e => e.status === status).map((event, index) => (
                        <Draggable key={event.id} draggableId={event.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style }}
                              data-testid={`event-card-${event.id}`}
                            >
                              <Card className={cn(
                                "bg-card hover:bg-card/80 transition-colors border-border/50 cursor-grab active:cursor-grabbing group",
                                snapshot.isDragging && "shadow-2xl scale-105 border-primary ring-1 ring-primary"
                              )}>
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{event.title}</h4>
                                    <Badge variant="secondary" className="text-[10px] h-5">{event.department}</Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <CalendarIcon className="w-3 h-3 mr-2" />
                                      {format(new Date(event.eventDate), "MMM dd, yyyy")}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3 mr-2" />
                                      {event.startTime} - {event.endTime}
                                    </div>
                                     <div className="flex items-center text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3 mr-2" />
                                      {event.venue}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>
    </div>
  );
}
