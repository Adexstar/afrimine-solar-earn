import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    })();
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe?.();
  }, []);
  return user;
}
