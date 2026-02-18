/**
 * Supabase Client for Backend (Vercel Serverless)
 * Uses service role key for admin operations
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('Warning: Supabase credentials not found in environment variables');
}

/**
 * Admin Supabase client using service role key
 * Has unrestricted access for backend operations
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Create user-scoped Supabase client
 * For operations that need to be restricted to a specific user
 */
export function createUserClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Verify JWT token with Supabase
 */
export async function verifySupabaseToken(token: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export default supabaseAdmin;
