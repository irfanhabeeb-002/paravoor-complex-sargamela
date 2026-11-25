import { createClient, SupabaseClient } from "@supabase/supabase-js";

const LOCAL_STORAGE_KEY = "paravoor_supabase_config";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  // 1. Check env vars
  const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. Check localStorage (configured via Admin UI)
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return { url: "", anonKey: "" };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  supabaseClientInstance = null; // Reset instance so it re-initializes
};

let supabaseClientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClientInstance) return supabaseClientInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith("http")) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(url, anonKey);
    return supabaseClientInstance;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith("http"));
};
