import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DraftIndicator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<{ updatedAt: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const { data } = await supabase
        .from('form_drafts' as any)
        .select('updated_at')
        .eq('user_id', user.id)
        .eq('form_type', 'account_setup')
        .maybeSingle();

      if (data) {
        setDraft({ updatedAt: (data as any).updated_at });
      }
    };
    load();
  }, [user?.id]);

  if (!draft) return null;

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">You have 1 unfinished report</h3>
              <p className="text-sm text-muted-foreground">
                Last saved{' '}
                {new Date(draft.updatedAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/account')}>
            Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftIndicator;