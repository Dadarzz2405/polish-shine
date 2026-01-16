import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceApi, sessionApi } from '@/services/api';
import { Session, AttendanceRecord, AttendanceSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check, X, Clock, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Attendance() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const canMark = hasRole('admin', 'ketua', 'pembina');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New session form
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsData, attendanceData, summaryData] = await Promise.all([
          sessionApi.getAll(),
          attendanceApi.getMyAttendance(),
          attendanceApi.getMySummary(),
        ]);
        setSessions(sessionsData as Session[]);
        setMyAttendance(attendanceData as AttendanceRecord[]);
        setSummary(summaryData as AttendanceSummary);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await sessionApi.create(newSessionName, newSessionDate);
      const sessionsData = await sessionApi.getAll();
      setSessions(sessionsData as Session[]);
      setNewSessionName('');
      setNewSessionDate('');
      setDialogOpen(false);
      toast({ title: 'Session created successfully' });
    } catch (error) {
      toast({
        title: 'Failed to create session',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success text-success-foreground"><Check className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'excused':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Excused</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-2">
            {canMark ? 'Manage sessions and mark attendance' : 'View your attendance history'}
          </p>
        </div>

        {canMark && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>Add a new attendance session</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="e.g., Weekly Meeting"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-date">Date</Label>
                  <Input
                    id="session-date"
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.attendance_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={canMark ? 'mark' : 'history'}>
        <TabsList>
          {canMark && <TabsTrigger value="mark">Mark Attendance</TabsTrigger>}
          <TabsTrigger value="history">My History</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {canMark && (
          <TabsContent value="mark" className="mt-6">
            <MarkAttendanceTab sessions={sessions} />
          </TabsContent>
        )}

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No attendance records yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      myAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.session?.name || `Session ${record.session_id}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.session?.date ? new Date(record.session.date).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>View all attendance sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No sessions created yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {session.name}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for marking attendance
function MarkAttendanceTab({ sessions }: { sessions: Session[] }) {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSessionChange = async (sessionId: string) => {
    setSelectedSession(sessionId);
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const data = await attendanceApi.getBySession(parseInt(sessionId));
      // Assuming the API returns members with their current attendance status
      setMembers((data as any).members || []);
      const attendanceMap: Record<number, string> = {};
      ((data as any).records || []).forEach((r: any) => {
        attendanceMap[r.user_id] = r.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (userId: number, status: string) => {
    setAttendance((prev) => ({ ...prev, [userId]: status }));
  };

  const handleSave = async () => {
    if (!selectedSession) return;

    setIsSaving(true);
    try {
      const records = Object.entries(attendance).map(([userId, status]) => ({
        user_id: parseInt(userId),
        status,
      }));
      await attendanceApi.bulkMark(parseInt(selectedSession), records);
      toast({ title: 'Attendance saved successfully' });
    } catch (error) {
      toast({
        title: 'Failed to save attendance',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Select a session and mark attendance for members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Session</Label>
          <Select value={selectedSession} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Choose a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id.toString()}>
                  {session.name} - {new Date(session.date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : selectedSession && members.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.username}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance[member.id] || ''}
                          onValueChange={(value) => handleStatusChange(member.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Attendance
            </Button>
          </>
        ) : selectedSession ? (
          <p className="text-muted-foreground text-center py-8">No members found for this session</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
