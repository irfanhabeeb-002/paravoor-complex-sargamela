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
  fetchGPayQR,
  fetchFooterBanners,
  subscribeToAllRealtimeData,
  DATA_CHANGE_EVENT,
  ChampionsSettings,
} from "@/lib/dataService";
import {
  MadrasaPointEntry,
  PARAVOOR_MADRASAS,
  DEFAULT_HADEETH,
  HadeethData,
  ProgramResultEntry,
  GPayQRData,
  DEFAULT_GPAY_QR,
  FooterBannersData,
  DEFAULT_FOOTER_BANNERS,
} from "@/data/paravoorData";

const Home: React.FC = () => {
  const [points, setPoints] = useState<MadrasaPointEntry[]>(PARAVOOR_MADRASAS);
  const [resultsMap, setResultsMap] = useState<Record<number, ProgramResultEntry>>({});
  const [hadeeth, setHadeeth] = useState<HadeethData>(DEFAULT_HADEETH);
  const [champions, setChampions] = useState<ChampionsSettings>({ enabled: false, champions: [] });
  const [gpayData, setGpayData] = useState<GPayQRData>(DEFAULT_GPAY_QR);
  const [footerBanners, setFooterBanners] = useState<FooterBannersData>(DEFAULT_FOOTER_BANNERS);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const [pts, res, had, champ, gpay, banners] = await Promise.all([
        fetchMadrasaPoints(),
        fetchProgramResults(),
        fetchHadeeth(),
        fetchIndividualChampions(),
        fetchGPayQR(),
        fetchFooterBanners(),
      ]);

      setPoints(pts);
      setResultsMap(res);
      setHadeeth(had);
      setChampions(champ);
      setGpayData(gpay);
      setFooterBanners(banners);
    } catch (err) {
      console.error("Error loading home page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // 1. Subscribe to Real-Time Updates (Supabase websockets + cross-tab broadcast + 3.5s auto polling)
    const unsubscribe = subscribeToAllRealtimeData((payload) => {
      if (payload.points) setPoints(payload.points);
      if (payload.resultsMap) setResultsMap(payload.resultsMap);
      if (payload.hadeeth) setHadeeth(payload.hadeeth);
      if (payload.champions) setChampions(payload.champions);
      if (payload.gpay) setGpayData(payload.gpay);
      if (payload.banners) setFooterBanners(payload.banners);
    });

    // 2. Local window event listener
    const handleDataChange = () => {
      loadAllData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      unsubscribe();
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

          {/* GPay QR Code Section (for Sargamela Public Funding) */}
          <QRCodeSection gpayData={gpayData} />
        </div>

        {/* Footer Presentation Banners (changes every 3-5s) & Credits */}
        <Footer bannersData={footerBanners} />
      </main>
    </div>
  );
};

export default Home;
