import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SeatingAssignment {
  rollNumber: string;
  name: string;
  room: string;
  seat: number;
}

export default function SeatingAlgorithm() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [stats, setStats] = useState({ total: 0, detained: 0, assigned: 0 });

  const generateSeating = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/faculty/seating-algo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to generate seating');

      const data = await response.json();
      setAssignments(data.assignments || []);
      setStats({
        total: data.totalStudents || 0,
        detained: data.detainedStudents || 0,
        assigned: data.assignments?.length || 0
      });

      toast({
        title: 'Seating Generated',
        description: `${data.assignments?.length || 0} students assigned to seats. ${data.detainedStudents || 0} students excluded (detained).`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate seating',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seating Algorithm</h1>
        <p className="text-muted-foreground">Automatically assign students to exam halls and seats</p>
      </div>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Smart Allocation
              </h3>
              <p className="text-sm text-muted-foreground">
                This algorithm filters out detained students and randomly assigns active students to exam rooms.
              </p>
            </div>
            <Button
              onClick={generateSeating}
              disabled={isGenerating}
              size="lg"
              className="whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isGenerating ? 'Generating...' : 'Generate Seating'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-red-400">Detained (Excluded)</p>
                  <p className="text-3xl font-bold text-red-400">{stats.detained}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-400">Assigned</p>
                  <p className="text-3xl font-bold text-green-400">{stats.assigned}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Seating Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {assignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
                    <div>
                      <p className="font-medium">{assignment.name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.rollNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{assignment.room}</Badge>
                      <Badge variant="default">Seat {assignment.seat}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
