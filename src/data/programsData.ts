export type ProgramCategory = "Kids" | "Children" | "Sub Junior" | "Junior" | "Senior";

export interface SargamelaProgram {
  id: number;
  name: string;
  category: ProgramCategory;
}

export const PROGRAM_CATEGORIES: { key: ProgramCategory | "All"; label: string; range: string }[] = [
  { key: "All", label: "ALL", range: "1-63" },
  { key: "Kids", label: "KIDS", range: "1-7" },
  { key: "Children", label: "CHILDREN", range: "8-15" },
  { key: "Sub Junior", label: "SUB JUNIOR", range: "16-28" },
  { key: "Junior", label: "JUNIOR", range: "29-41" },
  { key: "Senior", label: "SENIOR", range: "42-63" },
];

export const ALL_PROGRAMS: SargamelaProgram[] = [
  // Kids (1-7)
  { id: 1, name: "ACTION SONG MALAYALAM", category: "Kids" },
  { id: 2, name: "STORY TELLING MALAYALAM", category: "Kids" },
  { id: 3, name: "PICTURE COLOURING", category: "Kids" },
  { id: 4, name: "MEMORY TEST", category: "Kids" },
  { id: 5, name: "RHYME ENGLISH", category: "Kids" },
  { id: 6, name: "DIALOGUE SONG MALAYALAM", category: "Kids" },
  { id: 7, name: "GROUP SONG MALAYALAM", category: "Kids" },

  // Children (8-15)
  { id: 8, name: "QURAN RECITATION", category: "Children" },
  { id: 9, name: "HIFD", category: "Children" },
  { id: 10, name: "POEM RECITATION ARABIC", category: "Children" },
  { id: 11, name: "STORY TELLING MALAYALAM", category: "Children" },
  { id: 12, name: "ISLAMIC SONG MALAYALAM", category: "Children" },
  { id: 13, name: "GROUP SONG MALAYALAM", category: "Children" },
  { id: 14, name: "HAND WRITING ARABIC", category: "Children" },
  { id: 15, name: "PENCIL DRAWING", category: "Children" },

  // Sub Junior (16-28)
  { id: 16, name: "QURAN RECITATION", category: "Sub Junior" },
  { id: 17, name: "HIFD", category: "Sub Junior" },
  { id: 18, name: "PADAPPAYATTU VACHIKAM ARABIC", category: "Sub Junior" },
  { id: 19, name: "DICTATION ARABIC", category: "Sub Junior" },
  { id: 20, name: "PENCIL DRAWING", category: "Sub Junior" },
  { id: 21, name: "QUIZ MALAYALAM", category: "Sub Junior" },
  { id: 22, name: "TAWHEED SONG MALAYALAM", category: "Sub Junior" },
  { id: 23, name: "POEM RECITATION ARABIC", category: "Sub Junior" },
  { id: 24, name: "PRASANGAM GENERAL MALAYALAM", category: "Sub Junior" },
  { id: 25, name: "PRASANGAM GENERAL ARABIC", category: "Sub Junior" },
  { id: 26, name: "PRASANGAM GENERAL ENGLISH", category: "Sub Junior" },
  { id: 27, name: "GROUP SONG ARABIC", category: "Sub Junior" },
  { id: 28, name: "GROUP SONG MALAYALAM", category: "Sub Junior" },

  // Junior (29-41)
  { id: 29, name: "QURAN RECITATION", category: "Junior" },
  { id: 30, name: "HIFD", category: "Junior" },
  { id: 31, name: "PENCIL DRAWING", category: "Junior" },
  { id: 32, name: "PRABANDHAM MALAYALAM", category: "Junior" },
  { id: 33, name: "DIGITAL POSTER MAKING MALAYALAM", category: "Junior" },
  { id: 34, name: "QUIZ MALAYALAM", category: "Junior" },
  { id: 35, name: "PRASANGAM GENERAL MALAYALAM", category: "Junior" },
  { id: 36, name: "PRASANGAM GENERAL ARABIC", category: "Junior" },
  { id: 37, name: "PRASANGAM GENERAL ENGLISH", category: "Junior" },
  { id: 38, name: "POEM RECITATION ARABIC", category: "Junior" },
  { id: 39, name: "TAWHEED SONG MALAYALAM", category: "Junior" },
  { id: 40, name: "GROUP SONG MALAYALAM", category: "Junior" },
  { id: 41, name: "GROUP SONG ARABIC", category: "Junior" },

  // Senior (42-63)
  { id: 42, name: "HIFD WITH TAJWEED", category: "Senior" },
  { id: 43, name: "PRABANDHAM MALAYALAM", category: "Senior" },
  { id: 44, name: "PRABANDHAM ARABIC", category: "Senior" },
  { id: 45, name: "PRABANDHAM ENGLISH", category: "Senior" },
  { id: 46, name: "TRANSLATION MALAYALAM ARABIC", category: "Senior" },
  { id: 47, name: "DIGITAL POSTER MAKING MALAYALAM", category: "Senior" },
  { id: 48, name: "CALLIGRAPHY ARABIC", category: "Senior" },
  { id: 49, name: "QUIZ ARABIC", category: "Senior" },
  { id: 50, name: "TABLE TALK", category: "Senior" },
  { id: 51, name: "PRASANGAM GENERAL MALAYALAM", category: "Senior" },
  { id: 52, name: "PRASANGAM GENERAL ARABIC", category: "Senior" },
  { id: 53, name: "PRASANGAM GENERAL ENGLISH", category: "Senior" },
  { id: 54, name: "POEM RECITATION ARABIC MALE", category: "Senior" },
  { id: 55, name: "POEM RECITATION ARABIC FEMALE", category: "Senior" },
  { id: 56, name: "TAWHEED SONG MALAYALAM MALE", category: "Senior" },
  { id: 57, name: "TAWHEED SONG MALAYALAM FEMALE", category: "Senior" },
  { id: 58, name: "GROUP SONG ARABIC MALE", category: "Senior" },
  { id: 59, name: "GROUP SONG ARABIC FEMALE", category: "Senior" },
  { id: 60, name: "GROUP SONG MALAYALAM MALE", category: "Senior" },
  { id: 61, name: "GROUP SONG MALAYALAM FEMALE", category: "Senior" },
  { id: 62, name: "HADEES PAADAM", category: "Senior" },
  { id: 63, name: "KAYYEZHUTH MAGAZINE", category: "Senior" },
];

export const getProgramById = (id: number): SargamelaProgram | undefined => {
  return ALL_PROGRAMS.find((p) => p.id === id);
};

export const getProgramsByCategory = (category: ProgramCategory): SargamelaProgram[] => {
  return ALL_PROGRAMS.filter((p) => p.category === category);
};
