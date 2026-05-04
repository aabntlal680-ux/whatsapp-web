import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rixxshbiyahqogaythej.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHhzaGJpeWFocW9nYXl0aGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDM4ODgsImV4cCI6MjA5MzMxOTg4OH0.C0IANrYLuS0gcWLvPWrVS9PfdRxJGwQHnTNnpQrkBSM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
