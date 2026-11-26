import React from "react";
import { MadrasaPointEntry } from "@/data/paravoorData";
import { Trophy } from "lucide-react";

interface PointTableProps {
  points: MadrasaPointEntry[];
  loading?: boolean;
}

export const PointTable: React.FC<PointTableProps> = ({ points, loading }) => {
  // Always sort in descending order according to marks (points)
  const sortedPoints = [...points].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="w-full my-6">
      <div className="bg-[#991b1b] rounded-3xl p-5 sm:p-6 shadow-xl border border-red-900/30 text-white">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-300" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center font-sans">
            Point table
          </h2>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {sortedPoints.map((madrasa, index) => (
            <div
              key={madrasa.id}
              className="flex items-center gap-3 justify-between"
            >
              {/* Madrasa Name Pill */}
              <div className="flex-1 bg-white rounded-xl px-4 py-2.5 sm:py-3 shadow-xs flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                    index === 0
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : index === 1
                      ? "bg-slate-100 text-slate-700 border border-slate-300"
                      : index === 2
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-900 tracking-wide font-sans">
                  {madrasa.name}
                </span>
              </div>

              {/* Points Box */}
              <div className="w-20 sm:w-28 bg-white rounded-xl py-2.5 sm:py-3 shadow-xs text-center flex items-center justify-center">
                {loading ? (
                  <div className="h-5 w-8 bg-neutral-200 animate-pulse rounded" />
                ) : (
                  <span className="text-lg sm:text-xl font-black text-neutral-900 tabular-nums">
                    {madrasa.points}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
