import React from "react";
import { GPayQRData } from "@/data/paravoorData";
import { QRCodeSVG } from "qrcode.react";
import { Share2, HeartHandshake } from "lucide-react";

interface QRCodeSectionProps {
  gpayData: GPayQRData;
  siteUrl?: string;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({
  gpayData,
  siteUrl = "https://paravoor-complex-sargamela.netlify.app/",
}) => {
  if (!gpayData.enabled) return null;

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "KNM Paravoor Complex Madrasa Sargamela 2026",
          text: "മദ്രസ സർഗമേള 2026 ലൈവ് റിസൾട്ടുകളും പോയിൻ്റ് ടേബിളും കാണുക:",
          url: siteUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(siteUrl);
      alert("പോർട്ടൽ ലിങ്ക് കോപ്പി ചെയ്തു!");
    }
  };

  return (
    <section className="w-full my-8 text-center">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Malayalam Header above QR Box */}
        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-1">
          {gpayData.title || "മദ്രസ സർഗമേള 2026"}
        </h3>
        <p className="text-xs font-semibold text-neutral-500 mb-4 flex items-center justify-center gap-1">
          <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
          <span>{gpayData.subtitle || "സഹായ സംഭാവനകൾ അയക്കുവാൻ സ്കാൻ ചെയ്യുക (GPay / UPI)"}</span>
        </p>

        {/* QR Code Container (Red rounded box matching model interface) */}
        <div className="w-60 h-60 sm:w-64 sm:h-64 bg-[#dc2626] rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg relative border border-red-700">
          <div className="bg-white p-3 rounded-2xl shadow-inner w-full h-full flex flex-col items-center justify-center">
            {gpayData.qrImageUrl ? (
              <img
                src={gpayData.qrImageUrl}
                alt="Sargamela GPay QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2">
                <QRCodeSVG
                  value={gpayData.upiId || siteUrl}
                  size={160}
                  level="H"
                  includeMargin={false}
                  className="w-36 h-36 sm:w-40 sm:h-40"
                />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-wider mt-1">
                  GPay &bull; PhonePe &bull; UPI
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Share Results in Malayalam */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={handleShareResults}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full transition active:scale-95 shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-red-600" />
            <span>ഫലങ്ങൾ പങ്കുവെക്കുക (Share Results)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
