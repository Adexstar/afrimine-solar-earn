import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<any | null>(null);
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data ?? null);
    })();
  }, [userId]);
  return profile;
}
