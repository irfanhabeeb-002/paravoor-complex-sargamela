import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-10 pt-4 pb-8 border-t border-neutral-200">
      <div className="max-w-md mx-auto px-4 flex flex-col items-center text-center space-y-4">
        {/* Conference Banner */}
        <div className="w-full rounded-xl overflow-hidden shadow-xs border border-neutral-100 bg-white">
          <img
            src="/conference-footer.png"
            alt="KNM Ernakulam District Mujahid Sammelanam - 2027 January 24 Sunday Muvattupuzha"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Credits in subtle with low opacity */}
        <div className="pt-2 text-neutral-400 text-xs tracking-wider font-medium space-y-0.5 select-none opacity-60">
          <p>Designed by Ajmal &bull; Developed by Irfan</p>
          <p className="text-[10px] text-neutral-400/80">KNM Paravoor Complex &copy; 2026</p>
        </div>
      </div>
    </footer>
  );
};
