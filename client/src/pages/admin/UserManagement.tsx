import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient as globalQueryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  academic_status?: 'active' | 'detained';
  additional_roles?: string[];
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [studentName, setStudentName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('');
  const [studentYear, setStudentYear] = useState('1');
  const [studentDob, setStudentDob] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  const [seatingName, setSeatingName] = useState('');
  const [seatingId, setSeatingId] = useState('');
  const [seatingDesignation, setSeatingDesignation] = useState('');
  const [seatingDob, setSeatingDob] = useState('');
  const [seatingLoading, setSeatingLoading] = useState(false);

  const [clubName, setClubName] = useState('');
  const [clubId, setClubId] = useState('');
  const [clubClubName, setClubClubName] = useState('');
  const [clubDob, setClubDob] = useState('');
  const [clubLoading, setClubLoading] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Update academic status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/users/${userId}`, { academic_status: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'User status updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update status', variant: 'destructive' });
    },
  });

  // Toggle duty mutation
  const toggleDutyMutation = useMutation({
    mutationFn: async ({ userId, duty }: { userId: string; duty: string }) => {
      const user = users.find(u => u.id === userId);
      const currentRoles = user?.additional_roles || [];
      const newRoles = currentRoles.includes(duty)
        ? currentRoles.filter(r => r !== duty)
        : [...currentRoles, duty];
      return await apiRequest('PATCH', `/api/users/${userId}`, { additional_roles: newRoles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Success', description: 'User duty updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update duty', variant: 'destructive' });
    },
  });

  const dobToPassword = (dob: string) => {
    const [year, month, day] = dob.split('-');
    return `${day}${month}${year}`;
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName || !studentRollNo || !studentDepartment || !studentDob) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setStudentLoading(true);
    try {
      const password = dobToPassword(studentDob);
      await apiRequest('POST', '/api/users', {
        id: studentRollNo,
        password,
        role: 'student',
        name: studentName,
        department: studentDepartment,
        year: parseInt(studentYear),
      });

      toast({
        title: "Success",
        description: `Student ${studentRollNo} created successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      setStudentName('');
      setStudentRollNo('');
      setStudentDepartment('');
      setStudentYear('1');
      setStudentDob('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create student";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setStudentLoading(false);
    }
  };

  const handleAddSeatingManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seatingName || !seatingId || !seatingDesignation || !seatingDob) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSeatingLoading(true);
    try {
      const password = dobToPassword(seatingDob);
      await apiRequest('POST', '/api/users', {
        id: seatingId,
        password,
        role: 'faculty',
        name: seatingName,
        designation: seatingDesignation,
      });

      toast({
        title: "Success",
        description: `Faculty ${seatingId} created successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      setSeatingName('');
      setSeatingId('');
      setSeatingDesignation('');
      setSeatingDob('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create faculty";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSeatingLoading(false);
    }
  };

  const handleAddClubCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clubName || !clubId || !clubClubName || !clubDob) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setClubLoading(true);
    try {
      const password = dobToPassword(clubDob);
      await apiRequest('POST', '/api/users', {
        id: clubId,
        password,
        role: 'club_coordinator',
        name: clubName,
        club_name: clubClubName,
      });

      toast({
        title: "Success",
        description: `Club Coordinator ${clubId} created successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/users'] });

      setClubName('');
      setClubId('');
      setClubClubName('');
      setClubDob('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create club coordinator";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setClubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Create and manage system users</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="students">Add Student</TabsTrigger>
          <TabsTrigger value="seating">Add Faculty</TabsTrigger>
          <TabsTrigger value="club">Add Coordinator</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {error && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load users. Please refresh the page.</span>
              </CardContent>
            </Card>
          )}
          {usersLoading ? (
            <Card>
              <CardContent className="pt-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const isDetained = user.academic_status === 'detained';
                        const hasSeatingManager = user.additional_roles?.includes('seating_manager');
                        const hasClubCoordinator = user.additional_roles?.includes('club_coordinator');
                        return (
                          <tr key={user.id} className={cn('border-b border-border transition-colors', isDetained && 'bg-red-500/5')}>
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4"><Badge variant="outline" className="capitalize">{user.role}</Badge></td>
                            <td className="py-3 px-4 font-mono text-xs">{user.id}</td>
                            <td className="py-3 px-4">
                              {user.role === 'student' ? (
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={isDetained}
                                    onCheckedChange={(checked) => {
                                      updateStatusMutation.mutate({
                                        userId: user.id,
                                        status: checked ? 'detained' : 'active',
                                      });
                                    }}
                                    disabled={updateStatusMutation.isPending}
                                    data-testid={`toggle-status-${user.id}`}
                                  />
                                  <span className="text-xs">{isDetained ? 'Detained' : 'Active'}</span>
                                </div>
                              ) : (
                                <Badge variant="secondary">Active</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {user.role === 'faculty' && (
                                <Button
                                  size="sm"
                                  variant={hasSeatingManager ? 'default' : 'outline'}
                                  onClick={() => {
                                    toggleDutyMutation.mutate({
                                      userId: user.id,
                                      duty: 'seating_manager',
                                    });
                                  }}
                                  disabled={toggleDutyMutation.isPending}
                                  data-testid={`toggle-seating-${user.id}`}
                                >
                                  {hasSeatingManager ? 'Remove' : 'Add'} Seating
                                </Button>
                              )}
                              {user.role === 'student' && (
                                <Button
                                  size="sm"
                                  variant={hasClubCoordinator ? 'default' : 'outline'}
                                  onClick={() => {
                                    toggleDutyMutation.mutate({
                                      userId: user.id,
                                      duty: 'club_coordinator',
                                    });
                                  }}
                                  disabled={toggleDutyMutation.isPending}
                                  data-testid={`toggle-club-${user.id}`}
                                >
                                  {hasClubCoordinator ? 'Remove' : 'Add'} Club
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Student
              </CardTitle>
              <CardDescription>Create a new student account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Name</Label>
                    <Input
                      id="student-name"
                      placeholder="Full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      disabled={studentLoading}
                      required
                      data-testid="input-student-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-roll">Roll Number</Label>
                    <Input
                      id="student-roll"
                      placeholder="e.g., R101"
                      value={studentRollNo}
                      onChange={(e) => setStudentRollNo(e.target.value)}
                      disabled={studentLoading}
                      required
                      data-testid="input-student-roll"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-dept">Department</Label>
                    <Input
                      id="student-dept"
                      placeholder="e.g., CSE"
                      value={studentDepartment}
                      onChange={(e) => setStudentDepartment(e.target.value)}
                      disabled={studentLoading}
                      required
                      data-testid="input-student-dept"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-year">Year</Label>
                    <select
                      id="student-year"
                      value={studentYear}
                      onChange={(e) => setStudentYear(e.target.value)}
                      disabled={studentLoading}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      data-testid="select-student-year"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-dob">Date of Birth (for password)</Label>
                  <Input
                    id="student-dob"
                    type="date"
                    value={studentDob}
                    onChange={(e) => setStudentDob(e.target.value)}
                    disabled={studentLoading}
                    required
                    data-testid="input-student-dob"
                  />
                  <p className="text-xs text-muted-foreground">Password will be DDMMYYYY format of DOB</p>
                </div>

                <Button type="submit" disabled={studentLoading} className="w-full" data-testid="button-add-student">
                  {studentLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {studentLoading ? 'Creating...' : 'Create Student'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seating" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Seating Manager
              </CardTitle>
              <CardDescription>Create a new seating manager account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSeatingManager} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seating-name">Name</Label>
                    <Input
                      id="seating-name"
                      placeholder="Full name"
                      value={seatingName}
                      onChange={(e) => setSeatingName(e.target.value)}
                      disabled={seatingLoading}
                      required
                      data-testid="input-seating-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating-id">Faculty ID</Label>
                    <Input
                      id="seating-id"
                      placeholder="e.g., FAC001"
                      value={seatingId}
                      onChange={(e) => setSeatingId(e.target.value)}
                      disabled={seatingLoading}
                      required
                      data-testid="input-seating-id"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seating-designation">Designation</Label>
                  <Input
                    id="seating-designation"
                    placeholder="e.g., Associate Professor"
                    value={seatingDesignation}
                    onChange={(e) => setSeatingDesignation(e.target.value)}
                    disabled={seatingLoading}
                    required
                    data-testid="input-seating-designation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seating-dob">Date of Birth (for password)</Label>
                  <Input
                    id="seating-dob"
                    type="date"
                    value={seatingDob}
                    onChange={(e) => setSeatingDob(e.target.value)}
                    disabled={seatingLoading}
                    required
                    data-testid="input-seating-dob"
                  />
                  <p className="text-xs text-muted-foreground">Password will be DDMMYYYY format of DOB</p>
                </div>

                <Button type="submit" disabled={seatingLoading} className="w-full" data-testid="button-add-seating">
                  {seatingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {seatingLoading ? 'Creating...' : 'Create Seating Manager'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="club" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Club Coordinator
              </CardTitle>
              <CardDescription>Create a new club coordinator account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddClubCoordinator} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="club-name">Name</Label>
                    <Input
                      id="club-name"
                      placeholder="Full name"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      disabled={clubLoading}
                      required
                      data-testid="input-club-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="club-id">Coordinator ID</Label>
                    <Input
                      id="club-id"
                      placeholder="e.g., CID001"
                      value={clubId}
                      onChange={(e) => setClubId(e.target.value)}
                      disabled={clubLoading}
                      required
                      data-testid="input-club-id"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club-club-name">Club Name</Label>
                  <Input
                    id="club-club-name"
                    placeholder="e.g., Robotics Club"
                    value={clubClubName}
                    onChange={(e) => setClubClubName(e.target.value)}
                    disabled={clubLoading}
                    required
                    data-testid="input-club-club-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="club-dob">Date of Birth (for password)</Label>
                  <Input
                    id="club-dob"
                    type="date"
                    value={clubDob}
                    onChange={(e) => setClubDob(e.target.value)}
                    disabled={clubLoading}
                    required
                    data-testid="input-club-dob"
                  />
                  <p className="text-xs text-muted-foreground">Password will be DDMMYYYY format of DOB</p>
                </div>

                <Button type="submit" disabled={clubLoading} className="w-full" data-testid="button-add-club">
                  {clubLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {clubLoading ? 'Creating...' : 'Create Club Coordinator'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
