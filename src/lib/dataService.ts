import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import {
  PARAVOOR_MADRASAS,
  MadrasaPointEntry,
  DEFAULT_HADEETH,
  HadeethData,
  IndividualChampionEntry,
  ProgramResultEntry,
} from "@/data/paravoorData";
import { ALL_PROGRAMS } from "@/data/programsData";

// Local storage keys for resilient offline fallback
const LS_POINTS_KEY = "paravoor_madrasa_points_v1";
const LS_PROGRAMS_KEY = "paravoor_program_results_v1";
const LS_HADEETH_KEY = "paravoor_hadeeth_v1";
const LS_CHAMPIONS_KEY = "paravoor_champions_v1";
const LS_QR_KEY = "paravoor_qr_v1";

export const DATA_CHANGE_EVENT = "paravoor_data_changed";

export const notifyDataChange = (type: string) => {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { type } }));
};

// ── 1. Madrasa Points ────────────────────────────────────────────────────────
export const fetchMadrasaPoints = async (): Promise<MadrasaPointEntry[]> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("madrasa_points")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: MadrasaPointEntry[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          points: Number(item.points) || 0,
          order: item.display_order || 0,
        }));
        localStorage.setItem(LS_POINTS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn("Supabase fetch points error, fallback to local:", err);
    }
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LS_POINTS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  return PARAVOOR_MADRASAS;
};

export const saveMadrasaPoints = async (
  points: MadrasaPointEntry[]
): Promise<{ success: boolean; error?: string }> => {
  // Always update local storage first
  localStorage.setItem(LS_POINTS_KEY, JSON.stringify(points));
  notifyDataChange("points");

  const client = getSupabaseClient();
  if (client) {
    try {
      for (const item of points) {
        const { error } = await client.from("madrasa_points").upsert({
          id: item.id,
          name: item.name,
          points: item.points,
          display_order: item.order,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error("Supabase save points error:", err);
      return { success: false, error: err.message || "Failed to sync to Supabase" };
    }
  }

  return { success: true };
};

// ── 2. Program Results (PDFs) ────────────────────────────────────────────────
export const fetchProgramResults = async (): Promise<Record<number, ProgramResultEntry>> => {
  const resultsMap: Record<number, ProgramResultEntry> = {};

  // Initialize with all 63 programs
  ALL_PROGRAMS.forEach((prog) => {
    resultsMap[prog.id] = {
      programId: prog.id,
      programName: prog.name,
      category: prog.category,
    };
  });

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from("program_results").select("*");
      if (!error && data) {
        data.forEach((row) => {
          if (resultsMap[row.program_id]) {
            resultsMap[row.program_id].pdfUrl = row.pdf_url || undefined;
            resultsMap[row.program_id].pdfName = row.pdf_name || undefined;
            resultsMap[row.program_id].updatedAt = row.updated_at || undefined;
          }
        });
        localStorage.setItem(LS_PROGRAMS_KEY, JSON.stringify(resultsMap));
        return resultsMap;
      }
    } catch (err) {
      console.warn("Supabase fetch program results error, fallback to local:", err);
    }
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LS_PROGRAMS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.keys(parsed).forEach((key) => {
        const id = Number(key);
        if (resultsMap[id]) {
          resultsMap[id] = { ...resultsMap[id], ...parsed[id] };
        }
      });
    }
  } catch {
    // ignore
  }

  return resultsMap;
};

export const uploadProgramPdf = async (
  programId: number,
  file: File
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> => {
  const program = ALL_PROGRAMS.find((p) => p.id === programId);
  if (!program) return { success: false, error: "Program not found" };

  const fileName = `program_${programId}_${Date.now()}.pdf`;
  let publicUrl = "";

  const client = getSupabaseClient();
  if (client) {
    try {
      // Upload to Supabase Storage bucket 'sargamela-results'
      const { error: uploadError } = await client.storage
        .from("sargamela-results")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.warn("Supabase bucket upload error:", uploadError);
      } else {
        const { data: urlData } = client.storage
          .from("sargamela-results")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      // Upsert into program_results table
      await client.from("program_results").upsert({
        program_id: programId,
        program_name: program.name,
        category: program.category,
        pdf_url: publicUrl || undefined,
        pdf_name: file.name,
        status: "published",
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn("Supabase operation warning:", err);
    }
  }

  // If Supabase didn't produce URL, or as offline local fallback: convert to base64 Data URL
  if (!publicUrl) {
    publicUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Update localStorage
  try {
    const cached = localStorage.getItem(LS_PROGRAMS_KEY);
    const map = cached ? JSON.parse(cached) : {};
    map[programId] = {
      programId,
      programName: program.name,
      category: program.category,
      pdfUrl: publicUrl,
      pdfName: file.name,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LS_PROGRAMS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Local storage error:", err);
  }

  notifyDataChange("programs");
  return { success: true, pdfUrl: publicUrl };
};

export const deleteProgramPdf = async (
  programId: number
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from("program_results").update({
        pdf_url: null,
        pdf_name: null,
        status: "pending",
        updated_at: new Date().toISOString(),
      }).eq("program_id", programId);
    } catch (err) {
      console.warn("Supabase delete warning:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_PROGRAMS_KEY);
    if (cached) {
      const map = JSON.parse(cached);
      if (map[programId]) {
        delete map[programId].pdfUrl;
        delete map[programId].pdfName;
        map[programId].updatedAt = new Date().toISOString();
        localStorage.setItem(LS_PROGRAMS_KEY, JSON.stringify(map));
      }
    }
  } catch {
    // ignore
  }

  notifyDataChange("programs");
  return { success: true };
};

// ── 3. Hadeeth ───────────────────────────────────────────────────────────────
export const fetchHadeeth = async (): Promise<HadeethData> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "hadeeth")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_HADEETH_KEY, JSON.stringify(data.value));
        return data.value as HadeethData;
      }
    } catch (err) {
      console.warn("Supabase fetch hadeeth error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_HADEETH_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return DEFAULT_HADEETH;
};

export const saveHadeeth = async (
  hadeeth: HadeethData
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_HADEETH_KEY, JSON.stringify(hadeeth));
  notifyDataChange("hadeeth");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "hadeeth",
        value: hadeeth,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save hadeeth error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

// ── 4. Individual Champions ──────────────────────────────────────────────────
export interface ChampionsSettings {
  enabled: boolean;
  champions: IndividualChampionEntry[];
}

export const fetchIndividualChampions = async (): Promise<ChampionsSettings> => {
  const defaultState: ChampionsSettings = {
    enabled: false,
    champions: [
      { category: "Kids", championName: "", madrasa: "" },
      { category: "Children", championName: "", madrasa: "" },
      { category: "Sub Junior", championName: "", madrasa: "" },
      { category: "Junior", championName: "", madrasa: "" },
      { category: "Senior", championName: "", madrasa: "" },
    ],
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "individual_champions")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_CHAMPIONS_KEY, JSON.stringify(data.value));
        return data.value as ChampionsSettings;
      }
    } catch (err) {
      console.warn("Supabase fetch champions error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_CHAMPIONS_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return defaultState;
};

export const saveIndividualChampions = async (
  settings: ChampionsSettings
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_CHAMPIONS_KEY, JSON.stringify(settings));
  notifyDataChange("champions");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "individual_champions",
        value: settings,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save champions error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

// ── 5. QR Code Settings ──────────────────────────────────────────────────────
export interface QRCodeSettings {
  url: string;
  enabled: boolean;
  customImage?: string;
}

export const fetchQRCodeSettings = async (): Promise<QRCodeSettings> => {
  const defaultSettings: QRCodeSettings = {
    url: "https://paravoor-sargamela.msmernakulam.in/",
    enabled: true,
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "qr_code")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_QR_KEY, JSON.stringify(data.value));
        return data.value as QRCodeSettings;
      }
    } catch (err) {
      console.warn("Supabase fetch QR error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_QR_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return defaultSettings;
};

export const saveQRCodeSettings = async (
  settings: QRCodeSettings
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_QR_KEY, JSON.stringify(settings));
  notifyDataChange("qrcode");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "qr_code",
        value: settings,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save QR code error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};
