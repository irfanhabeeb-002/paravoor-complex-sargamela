import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QRCodeSettings } from "@/lib/dataService";
import { QrCode, Share2 } from "lucide-react";

interface QRCodeSectionProps {
  settings: QRCodeSettings;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ settings }) => {
  if (!settings.enabled) return null;

  const targetUrl = settings.url || "https://paravoor-sargamela.msmernakulam.in/";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "KNM Paravoor Complex Madrasa Sargamela 2026",
          text: "Check out live results and points of KNM Paravoor Complex Madrasa Sargamela 2026!",
          url: targetUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(targetUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <section className="w-full my-8 text-center">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Malayalam Header above QR Box */}
        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-4">
          മദ്രസ സർഗമേള 2026
        </h3>

        {/* QR Code Container */}
        <div className="w-56 h-56 sm:w-64 sm:h-64 bg-[#dc2626] rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg relative border border-red-700">
          <div className="bg-white p-3 rounded-2xl shadow-inner">
            <QRCodeSVG
              value={targetUrl}
              size={180}
              level="H"
              includeMargin={false}
              className="w-40 h-40 sm:w-48 sm:h-48"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>പോർട്ടൽ പങ്കുവെക്കുക (Share Portal)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
