export interface MadrasaPointEntry {
  id: string;
  name: string;
  points: number;
  order: number;
}

export const PARAVOOR_MADRASAS: MadrasaPointEntry[] = [
  { id: "purayar", name: "പുറയാർ", points: 0, order: 1 },
  { id: "manjali", name: "മാഞ്ഞാലി", points: 0, order: 2 },
  { id: "alamthuruth", name: "ആളംത്തുരുത്ത്", points: 0, order: 3 },
  { id: "parana", name: "പാറാന", points: 0, order: 4 },
];

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
