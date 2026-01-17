import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Session, AttendanceRecord, AttendanceSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check, X, Clock, Loader2 } from 'lucide-react';

export default function Attendance() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const canMark = hasRole('admin', 'ketua', 'pembina');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // New session form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sessionsData, attendanceData, summaryData] = await Promise.all([
        api.get<Session[]>('/api/sessions'),
        api.get<AttendanceRecord[]>('/api/my-attendance'),
        api.get<AttendanceSummary>('/api/my-attendance/summary'),
      ]);
      setSessions(sessionsData);
      setMyAttendance(attendanceData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/api/sessions', { name: newName, date: newDate });
      const newSessions = await api.get<Session[]>('/api/sessions');
      setSessions(newSessions);
      setNewName('');
      setNewDate('');
      setDialogOpen(false);
      toast({ title: 'Session created' });
    } catch (err) {
      toast({
        title: 'Failed to create session',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'excused':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Excused</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>

        {canMark && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Weekly Meeting"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
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
              <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.attendance_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>My Attendance History</CardTitle>
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
                  myAttendance.map(record => (
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

      {/* Mark Attendance Section (for authorized users) */}
      {canMark && <MarkAttendance sessions={sessions} />}
    </div>
  );
}

// Sub-component for marking attendance
function MarkAttendance({ sessions }: { sessions: Session[] }) {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSessionChange(sessionId: string) {
    setSelectedSession(sessionId);
    if (!sessionId) return;

    setLoading(true);
    try {
      const data = await api.get<any>(`/api/sessions/${sessionId}/attendance`);
      setMembers(data.members || []);
      const map: Record<number, string> = {};
      (data.records || []).forEach((r: any) => {
        map[r.user_id] = r.status;
      });
      setAttendance(map);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedSession) return;

    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([userId, status]) => ({
        user_id: parseInt(userId),
        status,
      }));
      await api.post('/api/attendance/bulk', {
        session_id: parseInt(selectedSession),
        records,
      });
      toast({ title: 'Attendance saved' });
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>Select a session and mark attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Session</label>
          <Select value={selectedSession} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name} - {new Date(s.date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
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
                  {members.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.username}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance[m.id] || ''}
                          onValueChange={v => setAttendance(prev => ({ ...prev, [m.id]: v }))}
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </>
        ) : selectedSession ? (
          <p className="text-muted-foreground text-center py-8">No members found</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
