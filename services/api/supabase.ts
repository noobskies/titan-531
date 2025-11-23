
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://arwczoyqfcleyiaosrdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd2N6b3lxZmNsZXlpYW9zcmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjMzNTIsImV4cCI6MjA3OTM5OTM1Mn0.6xJa--4w0W69pDTnY26DsS9CVl0nLtmwbrjZ1Ynnyqg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
