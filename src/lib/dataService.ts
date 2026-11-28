import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import {
  PARAVOOR_MADRASAS,
  MadrasaPointEntry,
  DEFAULT_HADEETH,
  HadeethData,
  IndividualChampionEntry,
  ProgramResultEntry,
  GPayQRData,
  DEFAULT_GPAY_QR,
  FooterBannersData,
  DEFAULT_FOOTER_BANNERS,
  ProgramScoresMap,
  calculateMadrasaTotals,
} from "@/data/paravoorData";
import { ALL_PROGRAMS } from "@/data/programsData";

// Local storage keys for resilient offline fallback
const LS_POINTS_KEY = "paravoor_madrasa_points_v1";
const LS_PROGRAMS_KEY = "paravoor_program_results_v1";
const LS_HADEETH_KEY = "paravoor_hadeeth_v1";
const LS_CHAMPIONS_KEY = "paravoor_champions_v1";
const LS_QR_KEY = "paravoor_qr_v1";
const LS_GPAY_QR_KEY = "paravoor_gpay_qr_v1";
const LS_FOOTER_BANNERS_KEY = "paravoor_footer_banners_v1";
const LS_PROGRAM_SCORES_KEY = "paravoor_program_scores_v1";

export const DATA_CHANGE_EVENT = "paravoor_data_changed";

export const notifyDataChange = (type: string) => {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { type } }));
  try {
    const bc = new BroadcastChannel("paravoor_realtime_sync");
    bc.postMessage({ type });
    bc.close();
  } catch {
    // ignore
  }
};

// ── 1. Madrasa Points ────────────────────────────────────────────────────────
export const fetchMadrasaPoints = async (): Promise<MadrasaPointEntry[]> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("madrasa_points")
        .select("*")
        .order("points", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MadrasaPointEntry[] = data
          .map((item) => ({
            id: item.id,
            name: item.name,
            points: Number(item.points) || 0,
          }))
          .sort((a, b) => b.points - a.points);
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
      const parsed: MadrasaPointEntry[] = JSON.parse(cached);
      return parsed.sort((a, b) => b.points - a.points);
    }
  } catch {
    // ignore
  }

  return [...PARAVOOR_MADRASAS].sort((a, b) => b.points - a.points);
};

export const saveMadrasaPoints = async (
  points: MadrasaPointEntry[]
): Promise<{ success: boolean; error?: string }> => {
  // Sort descending by marks (points)
  const sorted = [...points].sort((a, b) => b.points - a.points);

  // Always update local storage first
  localStorage.setItem(LS_POINTS_KEY, JSON.stringify(sorted));
  notifyDataChange("points");

  const client = getSupabaseClient();
  if (client) {
    try {
      for (const item of sorted) {
        const { error } = await client.from("madrasa_points").upsert({
          id: item.id,
          name: item.name,
          points: item.points,
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
  const program = ALL_PROGRAMS.find((p) => p.id === programId);

  // 1. Immediately update localStorage
  try {
    const cached = localStorage.getItem(LS_PROGRAMS_KEY);
    const map = cached ? JSON.parse(cached) : {};
    if (map[programId]) {
      delete map[programId].pdfUrl;
      delete map[programId].pdfName;
      map[programId].status = "pending";
      map[programId].updatedAt = new Date().toISOString();
    } else {
      map[programId] = {
        programId,
        programName: program?.name || "",
        category: program?.category || "",
        status: "pending",
        updatedAt: new Date().toISOString(),
      };
    }
    localStorage.setItem(LS_PROGRAMS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("Local storage delete error:", err);
  }

  notifyDataChange("programs");

  // 2. Update Supabase if client is configured
  const client = getSupabaseClient();
  if (client) {
    try {
      if (program) {
        await client.from("program_results").upsert({
          program_id: programId,
          program_name: program.name,
          category: program.category,
          pdf_url: null,
          pdf_name: null,
          status: "pending",
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Supabase delete warning:", err);
    }
  }

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

// ── 6. GPay QR Code for Public Funding ──────────────────────────────────────
export const fetchGPayQR = async (): Promise<GPayQRData> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "gpay_qr")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_GPAY_QR_KEY, JSON.stringify(data.value));
        return data.value as GPayQRData;
      }
    } catch (err) {
      console.warn("Supabase fetch GPay QR error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_GPAY_QR_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return DEFAULT_GPAY_QR;
};

export const saveGPayQR = async (
  gpay: GPayQRData
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_GPAY_QR_KEY, JSON.stringify(gpay));
  notifyDataChange("gpay_qr");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "gpay_qr",
        value: gpay,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save GPay QR error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

export const uploadGPayQRImage = async (
  file: File
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  let publicUrl = "";

  const client = getSupabaseClient();
  if (client) {
    try {
      const fileName = `gpay_qr_${Date.now()}.${file.name.split(".").pop() || "png"}`;
      const { error: uploadError } = await client.storage
        .from("sargamela-results")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = client.storage
          .from("sargamela-results")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }
    } catch (err) {
      console.warn("Supabase GPay QR upload error:", err);
    }
  }

  if (!publicUrl) {
    publicUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const current = await fetchGPayQR();
  const updated = { ...current, qrImageUrl: publicUrl };
  await saveGPayQR(updated);

  return { success: true, imageUrl: publicUrl };
};

// ── 7. Footer Banners (Presentation slideshow) ──────────────────────────────
export const fetchFooterBanners = async (): Promise<FooterBannersData> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "footer_banners")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_FOOTER_BANNERS_KEY, JSON.stringify(data.value));
        return data.value as FooterBannersData;
      }
    } catch (err) {
      console.warn("Supabase fetch footer banners error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_FOOTER_BANNERS_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return DEFAULT_FOOTER_BANNERS;
};

export const saveFooterBanners = async (
  data: FooterBannersData
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_FOOTER_BANNERS_KEY, JSON.stringify(data));
  notifyDataChange("footer_banners");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "footer_banners",
        value: data,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save footer banners error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

export const uploadFooterBannerImage = async (
  slotIndex: number,
  file: File
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  let publicUrl = "";

  const client = getSupabaseClient();
  if (client) {
    try {
      const fileName = `footer_banner_${slotIndex}_${Date.now()}.${file.name.split(".").pop() || "png"}`;
      const { error: uploadError } = await client.storage
        .from("sargamela-results")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: urlData } = client.storage
          .from("sargamela-results")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }
    } catch (err) {
      console.warn("Supabase footer banner upload error:", err);
    }
  }

  if (!publicUrl) {
    publicUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const current = await fetchFooterBanners();
  const newBanners = [...current.banners];
  newBanners[slotIndex] = publicUrl;
  const updated = { ...current, banners: newBanners };
  await saveFooterBanners(updated);

  return { success: true, imageUrl: publicUrl };
};

export const deleteFooterBannerImage = async (
  slotIndex: number
): Promise<{ success: boolean }> => {
  const current = await fetchFooterBanners();
  const newBanners = current.banners.filter((_, idx) => idx !== slotIndex);
  if (newBanners.length === 0) {
    newBanners.push("/conference-footer.png");
  }
  const updated = { ...current, banners: newBanners };
  await saveFooterBanners(updated);
  return { success: true };
};

// ── 8. Live TV Program Scores (0-15) ─────────────────────────────────────────
export const fetchProgramScores = async (): Promise<ProgramScoresMap> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "program_scores")
        .single();
      if (!error && data && data.value) {
        localStorage.setItem(LS_PROGRAM_SCORES_KEY, JSON.stringify(data.value));
        return data.value as ProgramScoresMap;
      }
    } catch (err) {
      console.warn("Supabase fetch program scores error:", err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_PROGRAM_SCORES_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }

  return {};
};

export const saveProgramScores = async (
  scores: ProgramScoresMap
): Promise<{ success: boolean; error?: string }> => {
  localStorage.setItem(LS_PROGRAM_SCORES_KEY, JSON.stringify(scores));
  notifyDataChange("program_scores");

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from("site_settings").upsert({
        key: "program_scores",
        value: scores,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase save program scores error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
};

// ── 9. Real-Time Auto Sync Engine (No Manual Refresh Needed) ────────────────
export interface RealtimeDataPayload {
  points?: MadrasaPointEntry[];
  resultsMap?: Record<number, ProgramResultEntry>;
  hadeeth?: HadeethData;
  champions?: ChampionsSettings;
  gpay?: GPayQRData;
  banners?: FooterBannersData;
  programScores?: ProgramScoresMap;
}

export const subscribeToAllRealtimeData = (
  onData: (payload: RealtimeDataPayload) => void
): (() => void) => {
  const client = getSupabaseClient();
  let channel: any = null;

  // 1. Supabase WebSockets (instant push from Postgres changes)
  if (client) {
    try {
      channel = client
        .channel("realtime-portal-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "madrasa_points" },
          async () => {
            const points = await fetchMadrasaPoints();
            onData({ points });
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "program_results" },
          async () => {
            const resultsMap = await fetchProgramResults();
            onData({ resultsMap });
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_settings" },
          async () => {
            const [had, champ, gpay, banners, scores] = await Promise.all([
              fetchHadeeth(),
              fetchIndividualChampions(),
              fetchGPayQR(),
              fetchFooterBanners(),
              fetchProgramScores(),
            ]);
            onData({ hadeeth: had, champions: champ, gpay, banners, programScores: scores });
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime subscription warning:", err);
    }
  }

  // 2. BroadcastChannel: Instant sync between multiple browser tabs on same device
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel("paravoor_realtime_sync");
    bc.onmessage = async (e) => {
      const type = e.data?.type;
      if (type === "points") {
        const points = await fetchMadrasaPoints();
        onData({ points });
      } else if (type === "programs") {
        const resultsMap = await fetchProgramResults();
        onData({ resultsMap });
      } else if (type === "program_scores") {
        const scores = await fetchProgramScores();
        onData({ programScores: scores });
      } else {
        const [pts, res, had, champ, gpay, banners, scores] = await Promise.all([
          fetchMadrasaPoints(),
          fetchProgramResults(),
          fetchHadeeth(),
          fetchIndividualChampions(),
          fetchGPayQR(),
          fetchFooterBanners(),
          fetchProgramScores(),
        ]);
        onData({
          points: pts,
          resultsMap: res,
          hadeeth: had,
          champions: champ,
          gpay,
          banners,
          programScores: scores,
        });
      }
    };
  } catch {
    // ignore
  }

  // 3. Storage event: Detects localStorage changes across tabs immediately
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LS_POINTS_KEY && e.newValue) {
      try {
        onData({ points: JSON.parse(e.newValue) });
      } catch {}
    } else if (e.key === LS_PROGRAMS_KEY && e.newValue) {
      try {
        onData({ resultsMap: JSON.parse(e.newValue) });
      } catch {}
    } else if (e.key === LS_PROGRAM_SCORES_KEY && e.newValue) {
      try {
        onData({ programScores: JSON.parse(e.newValue) });
      } catch {}
    }
  };
  window.addEventListener("storage", handleStorage);

  // 4. Background polling fallback (runs every 3.5 seconds)
  // Guarantees all spectators and TV screens refresh automatically without touching screen
  const pollTimer = setInterval(async () => {
    try {
      const [points, scores] = await Promise.all([
        fetchMadrasaPoints(),
        fetchProgramScores(),
      ]);
      onData({ points, programScores: scores });
    } catch {
      // silently ignore
    }
  }, 3500);

  return () => {
    if (channel && client) {
      client.removeChannel(channel);
    }
    if (bc) {
      bc.close();
    }
    window.removeEventListener("storage", handleStorage);
    clearInterval(pollTimer);
  };
};

