export interface MadrasaPointEntry {
  id: string;
  name: string;
  points: number;
}

export const PARAVOOR_MADRASAS: MadrasaPointEntry[] = [
  { id: "purayar", name: "പുറയാർ", points: 0 },
  { id: "alamthuruth", name: "ആളംത്തുരുത്ത്", points: 0 },
  { id: "manjali", name: "മാഞ്ഞാലി", points: 0 },
  { id: "parana", name: "പാറാന", points: 0 },
];

// Order of Madrasas for TV Scoreboards (matching reference layout)
export const SCOREBOARD_MADRASAS = [
  { id: "purayar", name: "പുറയാർ" },
  { id: "alamthuruth", name: "ആളംത്തുരുത്ത്" },
  { id: "manjali", name: "മാഞ്ഞാലി" },
  { id: "parana", name: "പാറാന" },
];

// Marks mapping: { [programId]: { [madrasaId]: mark (0-15) } }
export type ProgramScoresMap = Record<number, Record<string, number>>;

// Helper to calculate total marks and rankings from program scores
export const calculateMadrasaTotals = (scores: ProgramScoresMap) => {
  return SCOREBOARD_MADRASAS.map((m) => {
    let total = 0;
    for (const progId in scores) {
      const val = scores[progId]?.[m.id];
      if (typeof val === "number" && !isNaN(val)) {
        total += val;
      }
    }
    return {
      id: m.id,
      name: m.name,
      points: total,
    };
  }).sort((a, b) => b.points - a.points);
};

export interface IndividualChampionEntry {
  category: "Kids" | "Children" | "Sub Junior" | "Junior" | "Senior";
  championName: string;
  madrasa: string;
  points?: string;
  notes?: string;
}

export interface HadeethData {
  arabic: string;
  malayalam: string;
  reference: string;
  enabled: boolean;
}

export const DEFAULT_HADEETH: HadeethData = {
  arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
  malayalam: "ആരെങ്കിലും അറിവ് തേടി ഒരു വഴിയിലൂടെ സഞ്ചരിച്ചാൽ, അല്ലാഹു അവന് സ്വർഗ്ഗത്തിലേക്കുള്ള വഴി എളുപ്പമാക്കിക്കൊടുക്കും.",
  reference: "സ്വഹീഹ് മുസ്‌ലിം: 2699",
  enabled: true,
};

export interface ProgramResultEntry {
  programId: number;
  programName: string;
  category: string;
  pdfUrl?: string;
  pdfName?: string;
  updatedAt?: string;
}

export interface GPayQRData {
  enabled: boolean;
  qrImageUrl?: string;
  upiId?: string;
  title: string;
  subtitle: string;
}

export const DEFAULT_GPAY_QR: GPayQRData = {
  enabled: true,
  title: "മദ്രസ സർഗമേള 2026",
  subtitle: "സഹായ സംഭാവനകൾ അയക്കുവാൻ സ്കാൻ ചെയ്യുക (GPay / UPI)",
  qrImageUrl: "",
  upiId: "",
};

export interface FooterBannersData {
  intervalSeconds: number;
  banners: string[];
}

export const DEFAULT_FOOTER_BANNERS: FooterBannersData = {
  intervalSeconds: 4,
  banners: ["/conference-footer.png"],
};
