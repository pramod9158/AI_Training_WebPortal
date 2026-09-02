import { supabase, isSupabaseConfigured } from './supabaseClient';

export const INACTIVITY_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 Hours in milliseconds
const LAST_ACTIVITY_KEY = 'waynautic_last_activity_time';

export function recordUserActivity() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
}

export function getLastActivityTimestamp(): number {
  if (typeof window === 'undefined') return Date.now();
  const val = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (val) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) return num;
  }
  return Date.now();
}

export function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return false;
  const lastActive = getLastActivityTimestamp();
  const diff = Date.now() - lastActive;
  return diff > INACTIVITY_TIMEOUT_MS;
}

export async function checkAndHandleInactivityTimeout(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (isSessionExpired()) {
    console.warn('User session expired due to 8 hours of inactivity. Logging out...');
    await signOutUser();
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    return true; // Expired
  }
  
  recordUserActivity();
  return false; // Valid session
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  if (!isSupabaseConfigured) {
    return { data: { user: { id: 'demo-user-id', email }, session: null }, error: null };
  }

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: displayName || email.split('@')[0],
      },
    },
  });

  if (!error && data?.user) {
    recordUserActivity();
  }

  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { data: { user: { id: 'demo-user-id', email } }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data?.user) {
    recordUserActivity();
  }

  return { data, error };
}

export async function signOutUser() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem('waynautic_user_progress');
    localStorage.removeItem('waynautic_user_bookmarks');
    localStorage.removeItem('waynautic_user_badges');
    localStorage.removeItem('waynautic_user_streak');
    const profileKey = 'waynautic_user_profile';
    const saved = localStorage.getItem(profileKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        localStorage.setItem(profileKey, JSON.stringify({
          ...parsed,
          userId: undefined,
          email: undefined,
          displayName: 'Guest',
          avatarUrl: ''
        }));
      } catch {
        localStorage.removeItem(profileKey);
      }
    }
    window.dispatchEvent(new Event('waynautic_storage_change'));
  }
}

export async function getCurrentAuthUser() {
  if (!isSupabaseConfigured) {
    return null;
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function sendPasswordResetEmail(email: string) {
  if (!isSupabaseConfigured) {
    return { data: {}, error: null };
  }
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });
}

export async function updateUserPassword(newPassword: string) {
  if (!isSupabaseConfigured) {
    return { data: { user: null }, error: null };
  }
  return await supabase.auth.updateUser({
    password: newPassword
  });
}
