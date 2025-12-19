import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyllabusItem {
    id: string;
    subject: string;
    topic: string;
    status: 'pending' | 'completed';
}

export default function SyllabusManager() {
    const { toast } = useToast();
    const [items, setItems] = useState<SyllabusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTopic, setNewTopic] = useState('');
    const [subject, setSubject] = useState('Computer Science'); // Default
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const res = await fetch('/api/syllabus');
            const data = await res.json();
            setItems(data);
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to load syllabus', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const addTopic = async () => {
        if (!newTopic.trim()) return;
        setAdding(true);
        try {
            const res = await fetch('/api/syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    topic: newTopic,
                    status: 'pending',
                    totalUnits: 1
                })
            });
            const newItem = await res.json();
            setItems([...items, newItem]);
            setNewTopic('');
            toast({ title: 'Success', description: 'Topic added' });
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to add topic', variant: 'destructive' });
        } finally {
            setAdding(false);
        }
    };

    const toggleStatus = async (item: SyllabusItem) => {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        // Optimistic update
        setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));

        try {
            await fetch(`/api/syllabus/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            // Revert if failed
            setItems(items.map(i => i.id === item.id ? item : i));
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    const completedCount = items.filter(i => i.status === 'completed').length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                    Syllabus Manager
                </h1>
                <p className="text-muted-foreground">Track course progress and topics.</p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Course Progress</span>
                            <span>{Math.round(progress)}% Completed</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Topics</CardTitle>
                        <CardDescription>Manage your course topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? <div className="text-center p-4">Loading...</div> : (
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleStatus(item)}
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${item.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground'}`}
                                                >
                                                    {item.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                                </button>
                                                <span className={item.status === 'completed' ? 'line-through text-muted-foreground' : ''}>{item.topic}</span>
                                            </div>
                                            <Badge variant="outline">{item.subject}</Badge>
                                        </div>
                                    ))}
                                    {items.length === 0 && <div className="text-center text-muted-foreground py-8">No topics added yet.</div>}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Add Topic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Topic Name</label>
                                <Input
                                    value={newTopic}
                                    onChange={e => setNewTopic(e.target.value)}
                                    placeholder="e.g. Data Structures"
                                    onKeyDown={e => e.key === 'Enter' && addTopic()}
                                />
                            </div>
                            <Button onClick={addTopic} disabled={adding || !newTopic.trim()} className="w-full">
                                {adding && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Add Topic
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
