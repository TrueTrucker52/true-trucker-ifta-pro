import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AccountDeletionDialog = () => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    
    setDeleting(true);
    try {
      if (!user?.id) throw new Error('No user found');

      // Delete user data from all tables in order (respecting foreign keys)
      const deleteOperations = [
        supabase.from('trip_miles').delete().eq('user_id', user.id),
        supabase.from('bills_of_lading').delete().eq('user_id', user.id),
        supabase.from('trips').delete().eq('user_id', user.id),
        supabase.from('receipts').delete().eq('user_id', user.id),
        supabase.from('trip_logs').delete().eq('user_id', user.id),
        supabase.from('trucks').delete().eq('user_id', user.id),
        supabase.from('vehicles').delete().eq('user_id', user.id),
        supabase.from('invoices').delete().eq('user_id', user.id),
        supabase.from('user_roles').delete().eq('user_id', user.id),
        supabase.from('profiles').delete().eq('user_id', user.id),
      ];

      // Execute all deletions
      for (const operation of deleteOperations) {
        const { error } = await operation;
        if (error) {
          console.error('Delete operation error:', error);
          // Continue with other deletions even if one fails
        }
      }

      // Sign out the user
      await signOut();
      
      toast({
        title: 'Account deletion requested',
        description: 'Your data has been removed. Your authentication account will be deleted within 24 hours.',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Deletion failed',
        description: 'Unable to complete account deletion. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Request Account Deletion
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Your Account?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p>
                This action is <strong>permanent and cannot be undone</strong>. 
                All your data will be permanently removed, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All IFTA trip records and mileage logs</li>
                <li>Fuel receipts and scanned images</li>
                <li>Vehicle and truck information</li>
                <li>Bills of lading and invoices</li>
                <li>Company profile and settings</li>
                <li>All quarterly IFTA reports</li>
              </ul>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-medium text-destructive">
                  To confirm deletion, type <strong>DELETE</strong> below:
                </p>
              </div>
              <div>
                <Label htmlFor="confirm-delete" className="sr-only">
                  Type DELETE to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  placeholder="Type DELETE to confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  className="text-center font-mono"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={confirmText !== 'DELETE' || deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Deleting...' : 'Permanently Delete Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AccountDeletionDialog;
