import React from "react";
import { MadrasaPointEntry } from "@/data/paravoorData";
import { Trophy } from "lucide-react";

interface PointTableProps {
  points: MadrasaPointEntry[];
  loading?: boolean;
}

export const PointTable: React.FC<PointTableProps> = ({ points, loading }) => {
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
          {points.map((madrasa) => (
            <div
              key={madrasa.id}
              className="flex items-center gap-3 justify-between"
            >
              {/* Madrasa Name Pill */}
              <div className="flex-1 bg-white rounded-xl px-4 py-2.5 sm:py-3 shadow-xs flex items-center">
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
