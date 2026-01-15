import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.https://jxuririqcbsxcmmvuzfg.supabase.co!;
const supabaseAnonKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXJpcmlxY2JzeGNtbXZ1emZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzQwMDksImV4cCI6MjA4NDA1MDAwOX0.FpAJIEHzZHgUwi274ItyghVZCNuxmz5kllYqSFt4hhU!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
