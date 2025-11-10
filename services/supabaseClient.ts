import { createClient } from '@supabase/supabase-js';

// Solução de contorno específica para esta plataforma, que não tem UI para variáveis de ambiente.
// Em um ambiente de produção real (Vercel, Netlify, etc.), use as variáveis de ambiente da plataforma.
const supabaseUrl = 'https://wdpsuihshvykuubeovrw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHN1aWhzaHZ5a3V1YmVvdnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTQzMDIsImV4cCI6MjA3ODI5MDMwMn0.vlpnc0d2GpfdG2S8ukBIZ1FRZZ3ykkfI7xwpr4I-TeI';

if (!supabaseUrl || !supabaseAnonKey) {
  // Esta verificação é mantida por segurança, caso as variáveis sejam removidas.
  throw new Error("As credenciais do Supabase não foram encontradas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
