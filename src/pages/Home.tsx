import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { PointTable } from "@/components/PointTable";
import { ProgramResultsGrid } from "@/components/ProgramResultsGrid";
import { HadeethCard } from "@/components/HadeethCard";
import { IndividualChampions } from "@/components/IndividualChampions";
import { QRCodeSection } from "@/components/QRCodeSection";
import { Footer } from "@/components/Footer";
import {
  fetchMadrasaPoints,
  fetchProgramResults,
  fetchHadeeth,
  fetchIndividualChampions,
  fetchQRCodeSettings,
  DATA_CHANGE_EVENT,
  ChampionsSettings,
  QRCodeSettings,
} from "@/lib/dataService";
import {
  MadrasaPointEntry,
  PARAVOOR_MADRASAS,
  DEFAULT_HADEETH,
  HadeethData,
  ProgramResultEntry,
} from "@/data/paravoorData";

const Home: React.FC = () => {
  const [points, setPoints] = useState<MadrasaPointEntry[]>(PARAVOOR_MADRASAS);
  const [resultsMap, setResultsMap] = useState<Record<number, ProgramResultEntry>>({});
  const [hadeeth, setHadeeth] = useState<HadeethData>(DEFAULT_HADEETH);
  const [champions, setChampions] = useState<ChampionsSettings>({ enabled: false, champions: [] });
  const [qrSettings, setQrSettings] = useState<QRCodeSettings>({
    url: "https://paravoor-sargamela.msmernakulam.in/",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const [pts, res, had, champ, qr] = await Promise.all([
        fetchMadrasaPoints(),
        fetchProgramResults(),
        fetchHadeeth(),
        fetchIndividualChampions(),
        fetchQRCodeSettings(),
      ]);

      setPoints(pts);
      setResultsMap(res);
      setHadeeth(had);
      setChampions(champ);
      setQrSettings(qr);
    } catch (err) {
      console.error("Error loading home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Listen for local/realtime data changes
    const handleDataChange = () => {
      loadAllData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white sm:bg-neutral-50 flex flex-col items-center">
      <main className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-sm border-x border-neutral-100">
        <Header />

        <div className="px-4 flex-1 flex flex-col">
          {/* Madrasa Point Table */}
          <PointTable points={points} loading={loading} />

          {/* Individual Program Results Grid */}
          <ProgramResultsGrid resultsMap={resultsMap} />

          {/* Individual Champions (if enabled and entered) */}
          <IndividualChampions settings={champions} />

          {/* Hadeeth Card (if uploaded/enabled) */}
          <HadeethCard hadeeth={hadeeth} />

          {/* QR Code Section */}
          <QRCodeSection settings={qrSettings} />
        </div>

        {/* Footer Banner & Credits */}
        <Footer />
      </main>
    </div>
  );
};

export default Home;
