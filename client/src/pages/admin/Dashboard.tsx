import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Calendar, AlertTriangle, ShieldCheck, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExamMode } from '@/hooks/useExamMode';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { TicketVerifier } from '@/components/TicketVerifier';
import { UserManagement } from './UserManagement';
import { motion } from 'framer-motion';

// Chart data - will be fetched from database in future
const data: { name: string; events: number; exams: number }[] = [];

export default function AdminDashboard() {
  const { examMode, isLoading: examModeLoading, toggleExamMode: toggleExamModeApi } = useExamMode();
  const { events } = useEvents();
  const { toast } = useToast();

  // 📍 Debug: Component mount for admin
  useEffect(() => {
    console.log('👑 [ADMIN_DASHBOARD] Component mounted');
    const currentUserJson = localStorage.getItem('currentUser');
    const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
    console.log('👑 [ADMIN_DASHBOARD] Current user:', currentUser);
  }, []);

  const handleToggle = async (checked: boolean) => {
    await toggleExamModeApi(checked);
    toast({
      title: checked ? "Exam Mode Activated" : "Exam Mode Deactivated",
      description: checked ? "System is now in exam mode." : "System is back to normal mode.",
      className: checked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    });
  };

  const pendingEvents = events.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">System status and key metrics.</p>
        </div>
        <div className="flex items-center gap-4 bg-card/50 border border-white/10 p-3 rounded-xl backdrop-blur-md">
           <Label htmlFor="exam-mode" className="font-medium cursor-pointer">One-Click Exam Mode</Label>
           <Switch 
             id="exam-mode" 
             checked={examMode} 
             onCheckedChange={handleToggle}
             disabled={examModeLoading}
           />
           {examMode && <span className="text-xs text-red-400 font-bold animate-pulse">ACTIVE</span>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
        >
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span>Fetching from database...</span>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <h3 className="text-2xl font-bold">{pendingEvents}</h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><AlertTriangle className="w-5 h-5" /></div>
            </div>
             <div className="mt-4 text-xs text-muted-foreground">
              Requires immediate attention
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Exams</p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><FileText className="w-5 h-5" /></div>
            </div>
             <div className="mt-4 text-xs text-muted-foreground">
              Check exam schedule
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <h3 className="text-2xl font-bold">99.9%</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle className="w-5 h-5" /></div>
            </div>
             <div className="mt-4 text-xs text-muted-foreground">
              All systems operational
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Tabs for different admin functions */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Event requests vs Exams scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exams" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity Log</CardTitle>
            <CardDescription>Latest system actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
                <p className="text-sm">No activity logs available. Activities will appear here when users interact with the system.</p>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="tickets">
          <div className="grid grid-cols-1 gap-6">
            <TicketVerifier />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
