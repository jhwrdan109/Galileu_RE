// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = 'https://pvcanhsbbuktocfleuld.supabase.co';

// Chave anônima pública
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Y2FuaHNiYnVrdG9jZmxldWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDEwNTQsImV4cCI6MjA2MTExNzA1NH0.srru8Ed0dVd8uV0u7iFg292OXH52uD7Df59EI8ReXGk';

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
