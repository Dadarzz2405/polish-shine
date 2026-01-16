import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Access Forbidden</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
