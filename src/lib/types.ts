export type Category = "Kids" | "Children" | "Sub Junior" | "Junior" | "Senior";

export type Rank = "1" | "2" | "3";

export type Grade = "A" | "B" | "C" | "D";

export interface Program {
  id: number;
  name: string;
  category: Category;
}

export interface Participant {
  regNo: number;        // Primary key
  name: string;
  dob?: string;
  programs: number[];   // Array of program IDs
  category: Category;
  madrasa: string;      // From 'complex' field
  rawMadrasa?: string;
  sourcePage?: number;
}

export interface Result {
  id: string;
  participantName: string;
  participantRegNo: number;  // Add regNo
  madrasaName: string;
  programId: number;
  programName: string;
  category: Category;
  rank?: Rank | null;       // Optional - will be null initially
  grade?: Grade | null;      // Optional - will be null initially
  points?: number | null;    // Official competition points
}

export interface User {
  email: string;
  isAuthenticated: boolean;
}
