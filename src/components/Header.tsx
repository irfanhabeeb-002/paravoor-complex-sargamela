import React from "react";
import { Link } from "react-router-dom";
import { Lock, Radio } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="w-full">
      {/* Top Navbar */}
      <div className="w-full border-b border-neutral-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/sargamela-marjaan-logo.png"
              alt="Sargamela Logo"
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold text-neutral-900 leading-tight">
                Sargamela 2026
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                KNM Paravoor Complex
              </span>
            </div>
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition"
            title="Admin Desk"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>

      {/* Hero Section matching Model Interface */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-2 text-center flex flex-col items-center">
        {/* Three Logos */}
        <div className="flex items-center justify-center gap-5 sm:gap-6 mb-3">
          <img
            src="/knm-logo.png"
            alt="KNM Education Board"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          />
          <img
            src="/sargamela-marjaan-logo.png"
            alt="Sargamela Marjaan"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
          />
          <img
            src="/msm-balavedi-logo.png"
            alt="MSM Balavedi"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          />
        </div>

        {/* Bismillah */}
        <div className="my-2">
          <p
            className="text-lg sm:text-xl font-normal text-neutral-400 select-none tracking-wide"
            style={{ fontFamily: "'Amiri', serif" }}
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>

        {/* Live Portal Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-200 bg-white text-neutral-700 text-[11px] sm:text-xs font-bold tracking-wider shadow-2xs my-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>• SARGAMELA 2026 • OFFICIAL PORTAL</span>
          <span className="flex items-center gap-1 text-emerald-600 font-extrabold pl-1 border-l border-neutral-200">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        </div>

        {/* Main Headings */}
        <div className="mt-2 space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
            KNM Paravoor Complex
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            മദ്രസ സർഗമേള 2026
          </h2>
        </div>
      </div>
    </header>
  );
};
