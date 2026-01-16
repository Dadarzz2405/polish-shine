import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Users, 
  Calendar, 
  MessageSquare,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin', 'ketua', 'pembina');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your attendance system
        </p>
      </div>

      {/* Quick Stats - These will be populated from API */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
            <p className="text-xs text-muted-foreground">Your attendance</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Divisions
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Active divisions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Attendance
            </CardTitle>
            <CardDescription>
              {isAdmin ? 'Mark attendance for your division' : 'View your attendance history'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/attendance">
                {isAdmin ? 'Mark Attendance' : 'View History'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
            <CardDescription>
              View upcoming sessions and Islamic events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/calendar">
                View Calendar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Chat with our AI assistant for help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/chat">
                Start Chat
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
