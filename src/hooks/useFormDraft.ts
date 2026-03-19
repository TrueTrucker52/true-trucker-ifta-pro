import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AUTOSAVE_INTERVAL = 2 * 60 * 1000; // 2 minutes
const LOCAL_STORAGE_KEY = 'ifta_form_draft';

interface DraftMeta {
  updatedAt: string;
  currentStep: number;
}

export function useFormDraft<T extends Record<string, string>>(
  formType: string,
  formData: T,
  setFormData: (data: T) => void,
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draftMeta, setDraftMeta] = useState<DraftMeta | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const formDataRef = useRef(formData);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Keep ref in sync
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Save to localStorage as offline backup
  const saveToLocal = useCallback((data: T) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        formType,
        formData: data,
        updatedAt: new Date().toISOString(),
      }));
    } catch { /* storage full — ignore */ }
  }, [formType]);

  // Save draft to Supabase (upsert by user_id + form_type)
  const saveDraft = useCallback(async (silent = false) => {
    if (!user?.id) return;
    const data = formDataRef.current;

    // Don't save if form is completely empty
    const hasData = Object.values(data).some(v => !!v);
    if (!hasData) return;

    // Always save locally first
    saveToLocal(data);

    try {
      const { error } = await supabase
        .from('form_drafts' as any)
        .upsert(
          {
            user_id: user.id,
            form_type: formType,
            form_data: data,
            current_step: 0,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'user_id,form_type' }
        );

      if (error) throw error;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setLastAutoSave(timeStr);
      setAutoSaveError(false);

      if (!silent) {
        toast({
          title: '✅ Draft saved!',
          description: 'You can continue later.',
        });
      }
    } catch (err) {
      console.error('Draft save error:', err);
      setAutoSaveError(true);
      if (!silent) {
        toast({
          title: '⚠️ Save failed',
          description: 'Please try saving again.',
          variant: 'destructive',
        });
      }
    }
  }, [user?.id, formType, saveToLocal, toast]);

  // Delete draft after successful form submission
  const deleteDraft = useCallback(async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('form_drafts' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('form_type', formType);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setDraftMeta(null);
      setShowResumeBanner(false);
    } catch { /* ignore */ }
  }, [user?.id, formType]);

  // Load draft on mount
  useEffect(() => {
    if (!user?.id || draftLoaded) return;

    const loadDraft = async () => {
      try {
        const { data, error } = await supabase
          .from('form_drafts' as any)
          .select('form_data, updated_at, current_step')
          .eq('user_id', user.id)
          .eq('form_type', formType)
          .maybeSingle();

        if (!error && data) {
          const saved = data as any;
          setDraftMeta({
            updatedAt: saved.updated_at,
            currentStep: saved.current_step,
          });
          setShowResumeBanner(true);
          setDraftLoaded(true);
          return;
        }
      } catch { /* fall through to localStorage */ }

      // Fallback: check localStorage
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.formType === formType && parsed.formData) {
            setDraftMeta({ updatedAt: parsed.updatedAt, currentStep: 0 });
            setShowResumeBanner(true);
          }
        }
      } catch { /* ignore */ }

      setDraftLoaded(true);
    };

    loadDraft();
  }, [user?.id, formType, draftLoaded]);

  // Resume draft — load data into form
  const resumeDraft = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('form_drafts' as any)
        .select('form_data')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .maybeSingle();

      if (!error && data) {
        const saved = (data as any).form_data as T;
        setFormData(saved);
        setShowResumeBanner(false);
        toast({ title: '📋 Draft resumed', description: 'Your previous progress has been restored.' });
        return;
      }
    } catch { /* fall through */ }

    // Fallback: localStorage
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.formData) {
          setFormData(parsed.formData as T);
          setShowResumeBanner(false);
          toast({ title: '📋 Draft resumed (offline)', description: 'Restored from local backup.' });
        }
      }
    } catch { /* ignore */ }
  }, [user?.id, formType, setFormData, toast]);

  const dismissBanner = useCallback(() => setShowResumeBanner(false), []);

  // Auto-save timer
  useEffect(() => {
    if (!user?.id) return;

    timerRef.current = setInterval(() => {
      saveDraft(true);
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user?.id, saveDraft]);

  // Sync localStorage draft to Supabase when coming back online
  useEffect(() => {
    const handleOnline = () => {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local && user?.id) {
        saveDraft(true);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user?.id, saveDraft]);

  return {
    saveDraft,
    deleteDraft,
    resumeDraft,
    dismissBanner,
    showResumeBanner,
    draftMeta,
    lastAutoSave,
    autoSaveError,
  };
}
