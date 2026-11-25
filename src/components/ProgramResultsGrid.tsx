import React, { useState } from "react";
import { ALL_PROGRAMS, PROGRAM_CATEGORIES, SargamelaProgram, ProgramCategory } from "@/data/programsData";
import { ProgramResultEntry } from "@/data/paravoorData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, ExternalLink, Download, Clock } from "lucide-react";

interface ProgramResultsGridProps {
  resultsMap: Record<number, ProgramResultEntry>;
}

export const ProgramResultsGrid: React.FC<ProgramResultsGridProps> = ({ resultsMap }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeProgram, setActiveProgram] = useState<SargamelaProgram | null>(null);

  // Filter programs based on selected category
  const filteredPrograms = ALL_PROGRAMS.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const activeResult = activeProgram ? resultsMap[activeProgram.id] : undefined;
  const hasPdf = Boolean(activeResult?.pdfUrl);

  return (
    <section className="w-full my-6">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight text-center mb-4">
        Individual Program Results
      </h2>

      {/* Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar px-1">
        {PROGRAM_CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.key.toLowerCase();
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 7-column Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5 max-w-md mx-auto">
        {filteredPrograms.map((program) => {
          const result = resultsMap[program.id];
          const isPublished = Boolean(result?.pdfUrl);

          return (
            <button
              key={program.id}
              onClick={() => setActiveProgram(program)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center font-black text-lg sm:text-xl transition-all shadow-xs active:scale-95 select-none ${
                isPublished
                  ? "bg-[#7db343] text-white hover:bg-[#6fa338] ring-2 ring-[#5e8c30] ring-offset-1"
                  : "bg-[#8cc63f] text-neutral-900 hover:bg-[#7db343]"
              }`}
              title={`${program.id}. ${program.name} (${program.category})`}
            >
              <span>{program.id}</span>
              {isPublished && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-xs animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Program Result PDF Dialog */}
      <Dialog open={activeProgram !== null} onOpenChange={(open) => !open && setActiveProgram(null)}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-3xl">
          {activeProgram && (
            <>
              <DialogHeader className="text-left pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-bold">
                    #{activeProgram.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8cc63f] text-neutral-900 text-xs font-bold">
                    {activeProgram.category}
                  </span>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold mt-2 text-neutral-900 leading-snug">
                  {activeProgram.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500">
                  {hasPdf ? "Official Result Document" : "Result Status"}
                </DialogDescription>
              </DialogHeader>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-4 min-h-[280px] flex flex-col items-center justify-center">
                {hasPdf && activeResult?.pdfUrl ? (
                  <div className="w-full flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 truncate">
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="truncate">{activeResult.pdfName || `Result_Program_${activeProgram.id}.pdf`}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={activeResult.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={activeResult.pdfUrl}
                          download={`Program_${activeProgram.id}_${activeProgram.name}.pdf`}
                          className="p-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* PDF Preview Frame */}
                    <div className="w-full h-[400px] border border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
                      <iframe
                        src={`${activeResult.pdfUrl}#toolbar=0`}
                        title={activeProgram.name}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 space-y-3">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-neutral-900 text-base">
                        ഫലം ഉടൻ പ്രസിദ്ധീകരിക്കും
                      </h3>
                      <p className="text-xs text-neutral-500">
                        The result sheet for this program has not been published yet. Please check back later.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
