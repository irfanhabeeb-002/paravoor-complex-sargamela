import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SCOREBOARD_MADRASAS,
  ProgramScoresMap,
  calculateMadrasaTotals,
} from "@/data/paravoorData";
import {
  fetchProgramScores,
  subscribeToAllRealtimeData,
} from "@/lib/dataService";
import {
  Maximize,
  Minimize,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Radio,
  Tv,
} from "lucide-react";

interface ScoreboardSlide {
  id: string;
  categoryName: string;
  rangeLabel: string;
  programIds: number[];
  bgImage: string;
  type: "scoreboard" | "final";
}

const SLIDES: ScoreboardSlide[] = [
  {
    id: "kids",
    categoryName: "KIDS",
    rangeLabel: "1 - 7",
    programIds: [1, 2, 3, 4, 5, 6, 7],
    bgImage: "/kids_scoreboard.jpeg",
    type: "scoreboard",
  },
  {
    id: "children",
    categoryName: "CHILDREN",
    rangeLabel: "8 - 15",
    programIds: [8, 9, 10, 11, 12, 13, 14, 15],
    bgImage: "/children_scoreboard.jpeg",
    type: "scoreboard",
  },
  {
    id: "sub-junior",
    categoryName: "SUB JUNIOR",
    rangeLabel: "16 - 28",
    programIds: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    bgImage: "/sub-junior_scoreboard.jpeg",
    type: "scoreboard",
  },
  {
    id: "junior",
    categoryName: "JUNIOR",
    rangeLabel: "29 - 41",
    programIds: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
    bgImage: "/sub-junior_scoreboard.jpeg",
    type: "scoreboard",
  },
  {
    id: "senior",
    categoryName: "SENIOR",
    rangeLabel: "42 - 63",
    programIds: [
      42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
      61, 62, 63,
    ],
    bgImage: "/senior_scoreboard.jpeg",
    type: "scoreboard",
  },
  {
    id: "final",
    categoryName: "FINAL SCORESHEET",
    rangeLabel: "OVERALL",
    programIds: [],
    bgImage: "/FINAL_SCORESHEET.jpeg",
    type: "final",
  },
];

const DEFAULT_SLIDE_DURATION = 10000; // 10 seconds

export const TvScreening: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [scores, setScores] = useState<ProgramScoresMap>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial scores and subscribe to live changes
  useEffect(() => {
    fetchProgramScores().then(setScores);

    const unsubscribe = subscribeToAllRealtimeData((payload) => {
      if (payload.programScores) {
        setScores(payload.programScores);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Auto-hide controls when inactive
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  }, []);

  // Auto-slide carousel interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, DEFAULT_SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPlaying, currentSlideIndex]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (["1", "2", "3", "4", "5", "6"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < SLIDES.length) {
          setCurrentSlideIndex(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentSlide = SLIDES[currentSlideIndex];
  const rankings = calculateMadrasaTotals(scores);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center relative select-none font-sans"
    >
      {/* ── Main TV Aspect-Preserved Slide Box (3264 x 2168 ~ 1.505 ratio) ── */}
      <div
        className="relative overflow-hidden shadow-2xl bg-white"
        style={{
          width: "100vw",
          height: "100vh",
          maxWidth: "calc(100vh * (3264 / 2168))",
          maxHeight: "calc(100vw * (2168 / 3264))",
          aspectRatio: "3264 / 2168",
        }}
      >
        {/* Background Image */}
        <img
          src={currentSlide.bgImage}
          alt={currentSlide.categoryName}
          className="w-full h-full object-cover pointer-events-none absolute inset-0 z-0"
        />

        {/* ── Slide Type 1: Category Scoreboard ── */}
        {currentSlide.type === "scoreboard" && (() => {
          const isPrePrinted =
            currentSlide.id === "senior" ||
            currentSlide.id === "sub-junior" ||
            currentSlide.id === "junior";

          // Sizing based on number of columns
          const numCols = currentSlide.programIds.length;
          const isSenior = currentSlide.id === "senior";
          const isSubOrJunior =
            currentSlide.id === "sub-junior" || currentSlide.id === "junior";

          // Column 0 (Category / Madrasa Name) width - give generous width for Malayalam names
          const col0Width = isSenior
            ? "15%"
            : isSubOrJunior
            ? "18%"
            : "24%";

          // Fonts for program numbers (header)
          const progNumFont = isSenior
            ? "text-[0.9vw] sm:text-[0.85vw]"
            : isSubOrJunior
            ? "text-[1.25vw] sm:text-[1.15vw]"
            : "text-[1.8vw] sm:text-[1.6vw]";

          // Fonts for scores
          const scoreFont = isSenior
            ? "text-[1.05vw] sm:text-[1.0vw]"
            : isSubOrJunior
            ? "text-[1.35vw] sm:text-[1.25vw]"
            : "text-[1.9vw] sm:text-[1.7vw]";

          // Fonts for category title
          const catTitleFont = isSenior
            ? "text-[1.6vw] sm:text-[1.4vw]"
            : isSubOrJunior
            ? "text-[1.7vw] sm:text-[1.5vw]"
            : "text-[2.0vw] sm:text-[1.8vw]";

          // Fonts for madrasa names - carefully tuned so "ആളംത്തുരുത്ത്" never overflows or clips
          const madrasaNameFont = isSenior
            ? "text-[1.25vw] sm:text-[1.15vw]"
            : isSubOrJunior
            ? "text-[1.45vw] sm:text-[1.35vw]"
            : "text-[1.75vw] sm:text-[1.55vw]";

          return (
            <div
              className={`absolute z-10 grid overflow-hidden bg-white ${
                isPrePrinted
                  ? "rounded-[2.88vw] border-none"
                  : "rounded-[26px] sm:rounded-[34px] border-[2.5px] border-neutral-900"
              }`}
              style={{
                left: isPrePrinted ? "5.21%" : "6.25%",
                top: isPrePrinted ? "24.18%" : "25.0%",
                width: isPrePrinted ? "89.58%" : "87.5%",
                height: isPrePrinted ? "64.62%" : "62.5%",
                gridTemplateRows: "repeat(5, 1fr)",
                gridTemplateColumns: `${col0Width} repeat(${numCols}, 1fr)`,
              }}
            >
              {/* Row 0: Header Row */}
              {/* Category Name Cell */}
              <div className="border-r-[2.5px] border-b-[2.5px] border-neutral-900 flex items-center justify-center p-1 bg-white select-none">
                <span
                  className={`font-black text-neutral-950 tracking-tight text-center leading-none uppercase ${catTitleFont}`}
                >
                  {currentSlide.categoryName}
                </span>
              </div>

              {/* Program Numbers Header */}
              {currentSlide.programIds.map((progId, idx) => (
                <div
                  key={progId}
                  className={`border-b-[2.5px] border-neutral-900 flex items-center justify-center bg-white ${
                    idx < numCols - 1 ? "border-r-[1.5px]" : ""
                  }`}
                >
                  <span
                    className={`font-black text-neutral-900 leading-none select-none tabular-nums ${progNumFont}`}
                  >
                    {progId}
                  </span>
                </div>
              ))}

              {/* Rows 1 to 4: The 4 Madrasas */}
              {SCOREBOARD_MADRASAS.map((madrasa, rowIndex) => (
                <React.Fragment key={madrasa.id}>
                  {/* Madrasa Name Cell */}
                  <div
                    className={`border-r-[2.5px] border-neutral-900 flex items-center justify-start px-2 sm:px-4 bg-white overflow-hidden ${
                      rowIndex < SCOREBOARD_MADRASAS.length - 1 ? "border-b-[2px]" : ""
                    }`}
                  >
                    <span
                      className={`font-extrabold text-neutral-950 leading-tight font-sans tracking-wide whitespace-nowrap select-none ${madrasaNameFont}`}
                    >
                      {madrasa.name}
                    </span>
                  </div>

                  {/* Program Score Cells */}
                  {currentSlide.programIds.map((progId, colIdx) => {
                    const mark = scores[progId]?.[madrasa.id];
                    const hasMark = typeof mark === "number" && !isNaN(mark);

                    return (
                      <div
                        key={progId}
                        className={`flex items-center justify-center bg-white ${
                          rowIndex < SCOREBOARD_MADRASAS.length - 1
                            ? "border-b-[2px] border-neutral-900"
                            : ""
                        } ${colIdx < numCols - 1 ? "border-r-[1.5px] border-neutral-900" : ""}`}
                      >
                        {hasMark ? (
                          <span
                            className={`font-black text-neutral-950 leading-none tabular-nums ${scoreFont}`}
                          >
                            {mark}
                          </span>
                        ) : (
                          <span className="text-neutral-300 font-bold text-[1.2vw] leading-none select-none">
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          );
        })()}

        {/* ── Slide Type 2: Final Scoresheet (Calculated Rankwise) ── */}
        {currentSlide.type === "final" && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* The 4 Pills on FINAL_SCORESHEET.jpeg */}
            {[
              { top: "37.41%", rank: 1, medal: "🥇" },
              { top: "50.21%", rank: 2, medal: "🥈" },
              { top: "63.00%", rank: 3, medal: "🥉" },
              { top: "75.79%", rank: 4, medal: "🎖️" },
            ].map((pill, idx) => {
              const item = rankings[idx];

              return (
                <div
                  key={idx}
                  className="absolute flex items-center"
                  style={{
                    top: pill.top,
                    height: "10.86%",
                    left: "14.52%",
                    width: "70.9%",
                  }}
                >
                  {/* Left Section: Rank + Madrasa Name */}
                  <div
                    className="flex items-center gap-3 sm:gap-6 pl-4 sm:pl-8 h-full"
                    style={{ width: "73.8%" }}
                  >
                    <span className="text-[2.6vw] leading-none select-none drop-shadow-sm">
                      {pill.medal}
                    </span>
                    <span className="font-black text-neutral-900 text-[3.2vw] sm:text-[2.8vw] tracking-wide leading-tight font-sans">
                      {item ? item.name : "-"}
                    </span>
                  </div>

                  {/* Right Section: Total Points (calculated) */}
                  <div
                    className="flex items-center justify-center h-full pr-4 sm:pr-8"
                    style={{ width: "26.2%" }}
                  >
                    <span className="font-black text-neutral-950 text-[3.6vw] sm:text-[3.2vw] leading-none tabular-nums tracking-tight">
                      {item ? item.points : 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── On-Screen Broadcast TV Controls (Auto-Hides) ── */}
      <div
        className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/60 shadow-2xl text-white">
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-bold mr-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span className="tracking-wide">TV LIVE</span>
          </div>

          {/* Previous Slide */}
          <button
            onClick={() =>
              setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
            }
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition active:scale-95"
            title="Previous slide (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Play / Pause Auto-slide */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition active:scale-95"
            title={isPlaying ? "Pause auto-slide (Space)" : "Resume auto-slide (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-amber-400" />
            ) : (
              <Play className="w-5 h-5 text-emerald-400" />
            )}
          </button>

          {/* Next Slide */}
          <button
            onClick={() =>
              setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length)
            }
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition active:scale-95"
            title="Next slide (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition active:scale-95 ml-1"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── Slide Navigation Badges at Bottom (Auto-Hides) ── */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-neutral-700/60 shadow-2xl">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide transition active:scale-95 ${
                currentSlideIndex === idx
                  ? "bg-red-600 text-white shadow-md scale-105"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {slide.categoryName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TvScreening;
