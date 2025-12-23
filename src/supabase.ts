
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqmlloimcgsfjhhbenzk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbWxsb2ltY2dzZmpoaGJlbnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTk0MDgsImV4cCI6MjA4MjA5NTQwOH0.Ej8F_QC_emV9Pq_fGTvBK17sdNC3FJwmLZaQYDdSBvQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
