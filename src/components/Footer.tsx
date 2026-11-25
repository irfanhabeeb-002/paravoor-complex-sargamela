import React, { useState, useEffect } from "react";
import { FooterBannersData } from "@/data/paravoorData";

interface FooterProps {
  bannersData?: FooterBannersData;
}

export const Footer: React.FC<FooterProps> = ({ bannersData }) => {
  const banners = bannersData?.banners && bannersData.banners.length > 0
    ? bannersData.banners
    : ["/conference-footer.png"];

  const intervalMs = (bannersData?.intervalSeconds || 4) * 1000;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  return (
    <footer className="w-full mt-10 pt-4 pb-8 border-t border-neutral-200">
      <div className="max-w-md mx-auto px-4 flex flex-col items-center text-center space-y-4">
        {/* Carousel Presentation Container */}
        <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-neutral-200 bg-white relative min-h-[90px] flex items-center justify-center">
          {banners.map((bannerUrl, idx) => (
            <div
              key={idx}
              className={`w-full transition-opacity duration-700 ease-in-out ${
                idx === currentIndex
                  ? "opacity-100 relative z-10"
                  : "opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              <img
                src={bannerUrl}
                alt={`Sargamela Banner ${idx + 1}`}
                className="w-full h-auto object-contain max-h-36 block"
              />
            </div>
          ))}

          {/* Slide dots if multiple banners */}
          {banners.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
              {banners.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    dotIdx === currentIndex ? "w-3 bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
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
