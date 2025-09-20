// src/data/results.ts
export type Verdict = "genuine" | "fake" | "unknown";

export type ReceiptRow = {
  id: string;
  employee: string;
  location: string;
  amount: number;        // MYR
  date: string;          // YYYY-MM-DD
  validityPct: number;   // 0..1
  verdict: Verdict;
  flagged?: boolean;
  accepted?: boolean;
  factors?: string[];
  notes?: string[];
};

// deterministic “fake” generator so you get > 40 rows
const EMP = ["Ali","Mei","Hafiz","Asha","Ken","Tara","Jun","Zaid","Ira","Ben","Siti","Raj","Yen","Nur","Kai","Ivy","Han","Lia","Kim","Dina"];
const LOC = ["KLCC","MidValley","Penang","JB","Cheras","Bangsar","PJ","Shah Alam","Cyberjaya","SetiaWalk","KL Sentral","Subang","Puchong","Genting","Melaka","Ipoh","Ampang","Kuantan","Seremban","Rawang"];

function verdictFrom(v: number): Verdict {
  if (v >= 0.75) return "genuine";
  if (v < 0.35)  return "fake";
  return "unknown";
}

export const RESULTS_DATA: ReceiptRow[] = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1;
  const validity = ((i * 17) % 100) / 100;       // 0..0.99 pseudo-random
  const amount = Math.round(((i * 13) % 220 + 8.5) * 100) / 100;
  const emp = EMP[i % EMP.length];
  const loc = LOC[(i * 3) % LOC.length];
  const v = verdictFrom(validity);

  return {
    id: `R-2409-${String(n).padStart(3, "0")}`,
    employee: emp,
    location: loc,
    amount,
    date: `2025-09-${String((i % 28) + 1).padStart(2, "0")}`,
    validityPct: validity,
    verdict: v,
    factors: v === "fake"
      ? ["Font mismatch", "Vendor not found"]
      : v === "genuine"
      ? ["Vendor verified", "Tax ID valid"]
      : ["Low quality scan", "Insufficient features"],
    notes: v === "fake"
      ? ["Totals rounding pattern is unusual."]
      : v === "genuine"
      ? ["Matches vendor history (n>10)."]
      : ["Re-scan recommended for clearer OCR."]
  };
});
