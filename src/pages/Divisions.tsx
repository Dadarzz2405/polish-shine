import { useState, useEffect } from 'react';
import { divisionApi, userApi } from '@/services/api';
import { Division, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, Loader2, FolderOpen } from 'lucide-react';

export default function Divisions() {
  const { toast } = useToast();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New division form
  const [newDivisionName, setNewDivisionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Assign member
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisionsData, usersData] = await Promise.all([
          divisionApi.getAll(),
          userApi.getAll(),
        ]);
        setDivisions(divisionsData as Division[]);
        setUsers(usersData as User[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await divisionApi.create(newDivisionName);
      const divisionsData = await divisionApi.getAll();
      setDivisions(divisionsData as Division[]);
      setNewDivisionName('');
      setDialogOpen(false);
      toast({ title: 'Division created successfully' });
    } catch (error) {
      toast({
        title: 'Failed to create division',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDivision = async (id: number) => {
    if (!confirm('Are you sure you want to delete this division?')) return;

    try {
      await divisionApi.delete(id);
      setDivisions((prev) => prev.filter((d) => d.id !== id));
      toast({ title: 'Division deleted' });
    } catch (error) {
      toast({
        title: 'Failed to delete division',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePermission = async (division: Division) => {
    try {
      await divisionApi.setAttendancePermission(division.id, !division.can_mark_attendance);
      setDivisions((prev) =>
        prev.map((d) =>
          d.id === division.id ? { ...d, can_mark_attendance: !d.can_mark_attendance } : d
        )
      );
      toast({ title: 'Permission updated' });
    } catch (error) {
      toast({
        title: 'Failed to update permission',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleAssignMember = async () => {
    if (!selectedDivision || !selectedUserId) return;

    try {
      await divisionApi.assignMember(selectedDivision.id, parseInt(selectedUserId));
      const divisionsData = await divisionApi.getAll();
      setDivisions(divisionsData as Division[]);
      setAssignDialogOpen(false);
      setSelectedUserId('');
      toast({ title: 'Member assigned successfully' });
    } catch (error) {
      toast({
        title: 'Failed to assign member',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const unassignedUsers = users.filter((u) => !u.division_id);

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
          <h1 className="text-3xl font-bold text-foreground">Divisions</h1>
          <p className="text-muted-foreground mt-2">Manage divisions and member assignments</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Division
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Division</DialogTitle>
              <DialogDescription>Add a new division to organize members</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDivision} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="division-name">Division Name</Label>
                <Input
                  id="division-name"
                  placeholder="e.g., Dakwah"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Division
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assign Member Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Member to {selectedDivision?.name}</DialogTitle>
            <DialogDescription>Select a member to add to this division</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Member</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignMember} className="w-full" disabled={!selectedUserId}>
              Assign Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Division Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {divisions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No divisions created yet</p>
            </CardContent>
          </Card>
        ) : (
          divisions.map((division) => (
            <Card key={division.id} className="hover-scale">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      {division.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {division.members?.length || 0} members
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteDivision(division.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`perm-${division.id}`} className="text-sm">
                    Can mark attendance
                  </Label>
                  <Switch
                    id={`perm-${division.id}`}
                    checked={division.can_mark_attendance}
                    onCheckedChange={() => handleTogglePermission(division)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDivision(division);
                        setAssignDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {division.members && division.members.length > 0 ? (
                      division.members.map((member) => (
                        <Badge key={member.id} variant="secondary">
                          {member.username}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No members yet</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
