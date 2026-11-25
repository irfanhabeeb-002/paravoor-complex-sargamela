import React from "react";
import { HadeethData } from "@/data/paravoorData";
import { BookOpen } from "lucide-react";

interface HadeethCardProps {
  hadeeth: HadeethData;
}

export const HadeethCard: React.FC<HadeethCardProps> = ({ hadeeth }) => {
  if (!hadeeth.enabled || (!hadeeth.arabic && !hadeeth.malayalam)) {
    return null;
  }

  return (
    <section className="w-full my-6">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-5 sm:p-6 border border-amber-200/70 shadow-sm relative overflow-hidden">
        {/* Subtle decorative quote icon */}
        <div className="flex items-center justify-center gap-2 mb-3 text-amber-700/80">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">ഹദീസ് സന്ദേശം</span>
        </div>

        {/* Arabic Text */}
        {hadeeth.arabic && (
          <p
            className="text-center text-lg sm:text-xl font-medium text-amber-950 leading-relaxed my-2 font-serif"
            dir="rtl"
          >
            {hadeeth.arabic}
          </p>
        )}

        {/* Malayalam Translation */}
        {hadeeth.malayalam && (
          <p className="text-center text-sm sm:text-base font-medium text-neutral-800 leading-relaxed mt-2 font-sans">
            "{hadeeth.malayalam}"
          </p>
        )}

        {/* Reference */}
        {hadeeth.reference && (
          <p className="text-center text-xs font-semibold text-amber-800/80 mt-3 tracking-wide">
            {hadeeth.reference}
          </p>
        )}
      </div>
    </section>
  );
};
