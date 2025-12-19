import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Calendar, Clock, MapPin, Download, QrCode, BookOpen, ExternalLink, GraduationCap, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { HallTicketPDF } from '@/components/HallTicketPDF';
import { StudySupport } from '@/components/StudySupport';
import { useToast } from '@/hooks/use-toast';

// --- LIVE TICKER COMPONENT ---
const LiveTicker = () => {
  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 overflow-hidden h-10 flex items-center" data-testid="live-ticker">
      <div className="whitespace-nowrap animate-marquee flex gap-12 items-center px-4">
        {[
          "🚀 Hackathon 2025 Registrations open!",
          "📅 Final Exams start Dec 15th - Download Hall Tickets now.",
          "🎭 Drama Club audition: Tomorrow 4 PM.",
          "🏆 Congratulations to the Robotics Team for winning Gold!",
          "📢 Library hours extended during exam week."
        ].map((text, i) => (
          <span key={i} className="text-sm font-medium text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- MIND MAP COMPONENT ---
const initialNodes = [
  { id: '1', position: { x: 250, y: 0 }, data: { label: 'Computer Science Core' }, type: 'input', style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold' } },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'Data Structures' }, style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #3b82f6' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Algorithms' }, style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #3b82f6' } },
  { id: '4', position: { x: 0, y: 200 }, data: { label: 'Arrays & Lists' } },
  { id: '5', position: { x: 180, y: 200 }, data: { label: 'Trees & Graphs' } },
  { id: '6', position: { x: 350, y: 200 }, data: { label: 'Sorting' } },
  { id: '7', position: { x: 500, y: 200 }, data: { label: 'Dynamic Prog.' } },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-5', source: '2', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-6', source: '3', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-7', source: '3', target: '7', markerEnd: { type: MarkerType.ArrowClosed } },
];

const StudyMindMap = () => {
  return (
    <div className="h-[400px] w-full rounded-xl border border-border bg-card/50 overflow-hidden" data-testid="mind-map">
      <ReactFlow 
        nodes={initialNodes} 
        edges={initialEdges} 
        fitView
        attributionPosition="bottom-right"
        className="bg-black/20"
      >
        <Background color="#444" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// --- HALL TICKET MOCKUP ---
const HallTicket = () => {
  return (
    <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white text-black border-none shadow-2xl" asChild>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-w-3xl p-0 overflow-hidden bg-white text-black border-none shadow-2xl rounded-2xl"
      >
      <div className="flex flex-col h-full" id="print-area">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
               <GraduationCap className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold font-display">Nexus University</h2>
               <p className="text-sm opacity-70">Semester End Examinations - Winter 2025</p>
             </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="border-white/30 text-white">OFFICIAL</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex gap-8">
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-slate-500">Student Name</p>
                 <p className="font-bold text-lg" data-testid="student-name">Alex Johnson</p>
               </div>
               <div>
                 <p className="text-slate-500">Roll Number</p>
                 <p className="font-bold text-lg font-mono">CS-2025-042</p>
               </div>
               <div>
                 <p className="text-slate-500">Department</p>
                 <p className="font-bold">Computer Science</p>
               </div>
               <div>
                 <p className="text-slate-500">Semester</p>
                 <p className="font-bold">VI</p>
               </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2">15 Dec</td><td className="p-2">10:00 AM</td><td className="p-2 font-medium">Data Structures</td><td className="p-2 text-slate-500">CS301</td></tr>
                  <tr><td className="p-2">17 Dec</td><td className="p-2">10:00 AM</td><td className="p-2 font-medium">Database Mgmt</td><td className="p-2 text-slate-500">CS302</td></tr>
                  <tr><td className="p-2">19 Dec</td><td className="p-2">10:00 AM</td><td className="p-2 font-medium">Op. Systems</td><td className="p-2 text-slate-500">CS303</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-64 space-y-4 flex flex-col items-center border-l pl-8">
            <div className="w-32 h-40 bg-slate-200 rounded-md overflow-hidden border">
               <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Student" className="w-full h-full object-cover" />
            </div>
            
            <div className="bg-white p-2 border rounded-lg shadow-sm">
              <QrCode className="w-32 h-32" />
            </div>
            <p className="text-xs text-center text-slate-500 max-w-[150px]">
              Scan to verify identity and seating location.
            </p>

            <div className="w-full pt-4 border-t text-center">
              <p className="font-display font-bold text-lg text-primary">ROOM: 304</p>
              <p className="text-sm font-medium">Seat: A-12</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t flex justify-between items-center text-sm text-slate-500 mt-auto">
          <div className="flex gap-4">
             {/* PDF DOWNLOAD BUTTON */}
             <PDFDownloadLink
                document={<HallTicketPDF 
                  studentName="Alex Johnson" 
                  rollNumber="CS-2025-042" 
                  dept="Computer Science"
                  studentId="student-001"
                  roomNumber="304"
                  seatNumber="A-12"
                  semester={6}
                  exams={[
                    { date: "15 Dec", time: "10:00 AM", subject: "Data Structures", code: "CS301" },
                    { date: "17 Dec", time: "10:00 AM", subject: "Database Mgmt", code: "CS302" },
                    { date: "19 Dec", time: "10:00 AM", subject: "Op. Systems", code: "CS303" }
                  ]}
                />}
                fileName="hall-ticket-2025.pdf"
             >
                {({ blob, url, loading, error }) => (
                  <Button 
                    size="sm" 
                    disabled={loading} 
                    data-testid="button-download-pdf"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                )}
             </PDFDownloadLink>
          </div>
          <div className="space-x-4">
            <span>Controller of Examinations</span>
            <span>Principal</span>
          </div>
        </div>
      </div>
      </motion.div>
    </DialogContent>
  );
};

export default function StudentDashboard() {
  const { examMode } = useApp();
  const { toast } = useToast();

  // 📍 Debug: Component mount and user check
  useEffect(() => {
    console.log('📊 [STUDENT_DASHBOARD] Component mounted');
    
    const currentUserJson = localStorage.getItem('currentUser');
    const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
    
    console.log('📊 [STUDENT_DASHBOARD] Current user from localStorage:', {
      exists: !!currentUser,
      user: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        name: currentUser.name,
        additional_roles: currentUser.additional_roles
      } : 'null'
    });
    
    if (!currentUser) {
      console.error('❌ [STUDENT_DASHBOARD] No current user found! Dashboard rendering without user context.');
    }
  }, []);

  const handleTicketDownload = () => {
    setTimeout(() => {
      toast({
        title: "Hall Ticket Downloaded",
        description: "Your examination hall ticket has been successfully downloaded.",
        className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6">
        <LiveTicker />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Student Dashboard</h1>
          <p className="text-muted-foreground">Your academic information will appear here.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant={examMode ? "destructive" : "default"} 
                className={cn("gap-2 shadow-lg hover:shadow-primary/20 w-full md:w-auto", examMode && "animate-pulse")}
                data-testid="button-hall-ticket"
              >
                <Download className="w-4 h-4" />
                {examMode ? "Download Exam Hall Ticket" : "Get Hall Ticket"}
              </Button>
            </DialogTrigger>
            <HallTicket />
           </Dialog>
        </div>
      </div>

      {examMode && (
         <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-4" data-testid="alert-exam-mode">
           <AlertCircle className="w-6 h-6 text-red-500" />
           <div>
             <h3 className="font-bold text-red-500">Examination Mode Active</h3>
             <p className="text-sm text-red-400">All non-essential modules are minimized. Focus on your upcoming exams.</p>
           </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
          >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-muted-foreground text-sm">No classes scheduled for today. Check back later.</p>
              </div>
            </CardContent>
          </Card>
          </motion.div>

        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-muted-foreground text-sm">Your academic progress will appear here once you are enrolled.</p>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
          <Card className="glass-card bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Hackathon</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-muted-foreground mb-4">
                 Join the annual university hackathon. 48 hours of code, coffee, and creation.
               </p>
               <Button className="w-full">Register Now</Button>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>

      {/* Study Support Module */}
      <div className="mt-6">
        <StudySupport />
      </div>
    </div>
  );
}
