import { createClient } from '@supabase/supabase-js';

// Helper yang lebih robust untuk membaca ENV dari berbagai bundler (Vite, CRA, Next, Node)
const getEnv = (key: string) => {
  // 1. Cek Vite (import.meta.env)
  // Fix: Property 'env' does not exist on type 'ImportMeta'. Cast to any to access .env safely.
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env) {
    if (meta.env[`VITE_${key}`]) return meta.env[`VITE_${key}`];
    if (meta.env[key]) return meta.env[key];
  }

  // 2. Cek Process.env (Node / CRA / Webpack)
  if (typeof process !== 'undefined' && process.env) {
    // Cek key langsung dulu
    if (process.env[key]) return process.env[key];
    // Cek variasi prefix umum
    if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`];
  }

  return '';
};

// Ambil konfigurasi
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://zknwispjnvbqtqdrvkpb.supabase.co';
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbndpc3BqbnZicXRxZHJ2a3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTk0MjAsImV4cCI6MjA4NDAzNTQyMH0.8SblcOOGEuJp92-lmsFiS-McZesRU8Mm2vT1tSXM7JA';

// Cek validitas konfigurasi
const isUrlDefault = supabaseUrl === 'https://zknwispjnvbqtqdrvkpb.supabase.co';
const isKeyDefault = supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbndpc3BqbnZicXRxZHJ2a3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTk0MjAsImV4cCI6MjA4NDAzNTQyMH0.8SblcOOGEuJp92-lmsFiS-McZesRU8Mm2vT1tSXM7JA';
const isValid = supabaseUrl && !isUrlDefault && supabaseKey && !isKeyDefault;

if (!isValid) {
  console.warn("⚠️ Supabase Credentials Missing/Invalid.");
  console.warn("Pastikan anda memiliki .env file dengan SUPABASE_URL dan SUPABASE_ANON_KEY");
} else {
  console.log("✅ Supabase Connected:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper untuk mengecek apakah Supabase sudah dikonfigurasi dengan benar
export const isSupabaseConfigured = () => isValid;