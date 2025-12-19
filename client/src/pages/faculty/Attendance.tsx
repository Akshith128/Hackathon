import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, UserCheck, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Student {
    id: string;
    name: string;
    department: string;
    year: number;
}

interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent';
}

export default function Attendance() {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            const studentList = data.filter((u: any) => u.role === 'student' && u.academic_status !== 'detained');
            setStudents(studentList);

            // Default all to present
            const defaultState: Record<string, 'present' | 'absent'> = {};
            studentList.forEach((s: Student) => defaultState[s.id] = 'present');
            setAttendance(defaultState);
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id: string) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'present' ? 'absent' : 'present'
        }));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            // In a real app we might batch this, but here we just loop for demo simplicity
            // OR we just mark the ones we changed. Ideally API accepts batch. 
            // Current API is single item. Let's just save one for demo or log it.
            // Wait, let's just save ONE record per student for today.

            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            const promises = Object.entries(attendance).map(async ([studentId, status]) => {
                return fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        date: today,
                        status,
                        markedBy: currentUser.id || 'FACULTY',
                        courseId: 'CS101' // simplified
                    })
                });
            });

            await Promise.all(promises);

            toast({
                title: 'Attendance Saved',
                description: `Marked attendance for ${Object.keys(attendance).length} students.`
            });
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to save attendance', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === 'present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <UserCheck className="w-8 h-8 text-primary" />
                        Attendance Manager
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" /> {today}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Present: {presentCount}</Badge>
                        <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Absent: {absentCount}</Badge>
                    </div>
                    <Button onClick={saveAttendance} disabled={saving || loading}>
                        {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Attendance</>}
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <div className="grid grid-cols-[1fr_1fr_1fr_100px] gap-4 p-4 font-medium bg-muted/50 border-b">
                            <div>Student Name</div>
                            <div>Roll Number</div>
                            <div>Department</div>
                            <div className="text-center">Status</div>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading students...</div>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto">
                                {students.map(student => (
                                    <div key={student.id} className="grid grid-cols-[1fr_1fr_1fr_100px] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/20 transition-colors">
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-muted-foreground text-sm">{student.id}</div>
                                        <div className="text-muted-foreground text-sm">{student.department} - Year {student.year}</div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => toggleStatus(student.id)}
                                                className={`
                            h-8 w-24 rounded-full flex items-center justify-center gap-1 text-xs font-semibold transition-all
                            ${attendance[student.id] === 'present'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'}
                          `}
                                            >
                                                {attendance[student.id] === 'present' ? (
                                                    <><Check className="w-3 h-3" /> Present</>
                                                ) : (
                                                    <><X className="w-3 h-3" /> Absent</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
