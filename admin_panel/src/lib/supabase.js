import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

const isMock = !supabaseUrl || supabaseUrl.includes('your-') || !supabaseAnonKey || supabaseAnonKey.includes('your-');

export const supabase = isMock ? {
  auth: {
    signInWithPassword: async ({ email, password }) => {
      if (email === 'admin@test.com' && password === 'admin123') {
        return { data: { user: { email: 'admin@test.com' }, session: { access_token: 'mock-token' } }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials. Use admin@test.com / admin123 for demo.' } };
    },
    signOut: async () => ({ error: null }),
    getSession: async () => {
      const mockSession = typeof window !== 'undefined' ? localStorage.getItem('mock_session') : null;
      return { data: { session: mockSession ? JSON.parse(mockSession) : null }, error: null };
    },
    onAuthStateChange: (callback) => {
      // Mock auth state change
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: () => ({
    select: () => ({
      then: (fn) => fn({ data: [], error: null })
    })
  })
} : createClient(supabaseUrl, supabaseAnonKey);

export const isMockMode = isMock;
