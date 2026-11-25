import React from "react";
import { ChampionsSettings } from "@/lib/dataService";
import { Award, Crown } from "lucide-react";

interface IndividualChampionsProps {
  settings: ChampionsSettings;
}

export const IndividualChampions: React.FC<IndividualChampionsProps> = ({ settings }) => {
  if (!settings.enabled) return null;

  // Filter champions that have actual entered names
  const validChampions = settings.champions.filter(
    (c) => c.championName && c.championName.trim().length > 0
  );

  if (validChampions.length === 0) return null;

  return (
    <section className="w-full my-6">
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-5 sm:p-6 border border-yellow-200 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4 text-amber-800">
          <Crown className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-center">
            Individual Champions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {validChampions.map((champ) => (
            <div
              key={champ.category}
              className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                    {champ.category}
                  </span>
                  <h3 className="font-bold text-neutral-900 text-base mt-1">
                    {champ.championName}
                  </h3>
                  {champ.madrasa && (
                    <p className="text-xs text-neutral-600 font-medium">
                      {champ.madrasa}
                    </p>
                  )}
                </div>
              </div>

              {champ.points && (
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-amber-700">
                    {champ.points}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-semibold uppercase">
                    Pts
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
