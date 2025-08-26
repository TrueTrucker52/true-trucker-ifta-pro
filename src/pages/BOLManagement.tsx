import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { BOLManager } from '@/components/BOLManager';
import { TrialGuard } from '@/components/TrialGuard';

const BOLManagement = () => {
  const navigate = useNavigate();

  return (
    <TrialGuard feature="BOL Management" requiredTier="small">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BOL Management</h1>
                <p className="text-sm text-muted-foreground">Manage your Bills of Lading and load documents</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <BOLManager />
        </main>
      </div>
    </TrialGuard>
  );
};

export default BOLManagement;