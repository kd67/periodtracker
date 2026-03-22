import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email?: string;
};

export async function signUpAnonymously(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error('Anonymous sign-in error:', error);
    return null;
  }

  if (!data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      callback(null);
    }
  });

  return data?.subscription;
}
