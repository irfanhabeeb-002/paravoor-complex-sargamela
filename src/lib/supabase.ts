import { createClient, SupabaseClient } from "@supabase/supabase-js";

const LOCAL_STORAGE_KEY = "paravoor_supabase_config";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const cleanValue = (val: string): string => {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
};

export const getSupabaseConfig = (): SupabaseConfig => {
  // 1. Check env vars
  const envUrl = cleanValue(import.meta.env.VITE_SUPABASE_URL || "");
  const envKey = cleanValue(import.meta.env.VITE_SUPABASE_ANON_KEY || "");

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. Check localStorage (configured via Admin UI)
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: cleanValue(parsed.url),
          anonKey: cleanValue(parsed.anonKey),
        };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  return { url: "", anonKey: "" };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  const cleanedUrl = cleanValue(url);
  const cleanedKey = cleanValue(anonKey);

  if (!cleanedUrl && !cleanedKey) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ url: cleanedUrl, anonKey: cleanedKey })
    );
  }

  supabaseClientInstance = null; // Reset instance
};

export const clearSupabaseConfig = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  supabaseClientInstance = null;
};

let supabaseClientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClientInstance) return supabaseClientInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith("http")) {
    return null;
  }

  try {
    supabaseClientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false, // Prevents expired auth tokens from overriding anon key
        autoRefreshToken: false,
      },
      global: {
        headers: {
          apikey: anonKey,
        },
      },
    });
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
