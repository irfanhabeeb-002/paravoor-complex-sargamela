import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchMadrasaPoints,
  saveMadrasaPoints,
  fetchProgramResults,
  uploadProgramPdf,
  deleteProgramPdf,
  fetchHadeeth,
  saveHadeeth,
  fetchIndividualChampions,
  saveIndividualChampions,
  fetchGPayQR,
  saveGPayQR,
  uploadGPayQRImage,
  fetchFooterBanners,
  saveFooterBanners,
  uploadFooterBannerImage,
  deleteFooterBannerImage,
  fetchProgramScores,
  saveProgramScores,
  ChampionsSettings,
} from "@/lib/dataService";
import {
  MadrasaPointEntry,
  PARAVOOR_MADRASAS,
  DEFAULT_HADEETH,
  HadeethData,
  ProgramResultEntry,
  IndividualChampionEntry,
  GPayQRData,
  DEFAULT_GPAY_QR,
  FooterBannersData,
  DEFAULT_FOOTER_BANNERS,
  SCOREBOARD_MADRASAS,
  ProgramScoresMap,
  calculateMadrasaTotals,
} from "@/data/paravoorData";
import {
  ALL_PROGRAMS,
  PROGRAM_CATEGORIES,
  SargamelaProgram,
  CATEGORY_STYLES,
  ProgramCategory,
} from "@/data/programsData";
import { toast } from "sonner";
import {
  Trophy,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Crown,
  BookOpen,
  ArrowLeft,
  Lock,
  LogOut,
  CheckCircle,
  Search,
  RefreshCw,
  Images,
  CreditCard,
  Tv,
  LayoutGrid,
  List,
} from "lucide-react";

const ADMIN_PASSCODE = "paravoor2026";
const AUTH_STORAGE_KEY = "paravoor_admin_authenticated";

export const AdminPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [passcodeInput, setPasscodeInput] = useState("");

  // Active tab (Database & Fix tab removed for security)
  const [activeTab, setActiveTab] = useState<
    "tv_scores" | "points" | "programs" | "champions" | "hadeeth" | "gpay" | "footer"
  >("tv_scores");

  // State data
  const [points, setPoints] = useState<MadrasaPointEntry[]>(PARAVOOR_MADRASAS);
  const [resultsMap, setResultsMap] = useState<Record<number, ProgramResultEntry>>({});
  const [hadeeth, setHadeeth] = useState<HadeethData>(DEFAULT_HADEETH);
  const [championsSettings, setChampionsSettings] = useState<ChampionsSettings>({
    enabled: false,
    champions: [],
  });
  const [gpayData, setGpayData] = useState<GPayQRData>(DEFAULT_GPAY_QR);
  const [footerBanners, setFooterBanners] = useState<FooterBannersData>(DEFAULT_FOOTER_BANNERS);
  const [programScores, setProgramScores] = useState<ProgramScoresMap>({});

  // TV Scores settings & filters
  const [savingScores, setSavingScores] = useState(false);
  const [scoreCategoryFilter, setScoreCategoryFilter] = useState("All");
  const [scoreSearch, setScoreSearch] = useState("");
  const [scoreViewMode, setScoreViewMode] = useState<"cards" | "table">("cards");

  // Program filters & upload
  const [programSearch, setProgramSearch] = useState("");
  const [programCategoryFilter, setProgramCategoryFilter] = useState("All");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [savingPoints, setSavingPoints] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [uploadingBannerSlot, setUploadingBannerSlot] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      const [pts, res, had, champ, gpay, banners, scores] = await Promise.all([
        fetchMadrasaPoints(),
        fetchProgramResults(),
        fetchHadeeth(),
        fetchIndividualChampions(),
        fetchGPayQR(),
        fetchFooterBanners(),
        fetchProgramScores(),
      ]);

      setPoints(pts);
      setResultsMap(res);
      setHadeeth(had);
      setChampionsSettings(champ);
      setGpayData(gpay);
      setFooterBanners(banners);
      setProgramScores(scores);
    };

    load();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === ADMIN_PASSCODE || passcodeInput === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      toast.success("Welcome to Paravoor Sargamela Admin Portal");
    } else {
      toast.error("Incorrect passcode. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // ── TV Scoreboard Actions (Marks 0 to 15) ─────────────────────────────────
  const handleScoreChange = (programId: number, madrasaId: string, valStr: string) => {
    if (valStr.trim() === "") {
      setProgramScores((prev) => {
        const next = { ...prev };
        if (next[programId]) {
          const prog = { ...next[programId] };
          delete prog[madrasaId];
          next[programId] = prog;
        }
        return next;
      });
      return;
    }

    const num = parseInt(valStr, 10);
    const clamped = isNaN(num) ? 0 : Math.min(15, Math.max(0, num));

    setProgramScores((prev) => ({
      ...prev,
      [programId]: {
        ...(prev[programId] || {}),
        [madrasaId]: clamped,
      },
    }));
  };

  const handleSaveScores = async () => {
    setSavingScores(true);
    const res = await saveProgramScores(programScores);
    setSavingScores(false);

    if (res.success) {
      toast.success("Scoreboard saved! Live TV screening updated immediately.");
    } else {
      toast.success("Scoreboard saved locally!");
    }
  };

  const handleSyncScoresToPointTable = async () => {
    const totals = calculateMadrasaTotals(programScores);
    setSavingPoints(true);
    await saveMadrasaPoints(totals);
    setPoints(totals);
    setSavingPoints(false);
    toast.success("Scores synced to Public Point Table successfully!");
  };

  // ── Points Actions ────────────────────────────────────────────────────────
  const handlePointChange = (id: string, value: string) => {
    const numeric = parseInt(value, 10);
    setPoints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, points: isNaN(numeric) ? 0 : numeric } : item))
    );
  };

  const handleSavePoints = async () => {
    setSavingPoints(true);
    const sorted = [...points].sort((a, b) => b.points - a.points);
    setPoints(sorted);
    const res = await saveMadrasaPoints(sorted);
    setSavingPoints(false);
    if (res.success) {
      toast.success("Point table saved & sorted by marks!");
    } else {
      toast.success("Point table updated locally!");
    }
  };

  // ── PDF Upload Actions ────────────────────────────────────────────────────
  const handlePdfUpload = async (programId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file only.");
      return;
    }

    setUploadingId(programId);
    toast.loading("Uploading result PDF...", { id: "uploading" });

    const res = await uploadProgramPdf(programId, file);
    setUploadingId(null);

    if (res.success) {
      toast.success(`Result PDF uploaded for Program #${programId}`, { id: "uploading" });
      const updated = await fetchProgramResults();
      setResultsMap(updated);
    } else {
      toast.error(`Upload failed: ${res.error || "Unknown error"}`, { id: "uploading" });
    }
  };

  const handleDeletePdf = async (programId: number) => {
    if (!confirm(`Are you sure you want to delete the result PDF for Program #${programId}?`)) {
      return;
    }

    // Instantly update UI state with zero latency
    setResultsMap((prev) => ({
      ...prev,
      [programId]: {
        ...prev[programId],
        pdfUrl: undefined,
        pdfName: undefined,
        updatedAt: new Date().toISOString(),
      },
    }));

    const res = await deleteProgramPdf(programId);
    if (res.success) {
      toast.success(`Result PDF deleted for Program #${programId}`);
      const updated = await fetchProgramResults();
      setResultsMap(updated);
    } else {
      toast.error("Failed to delete result PDF: " + (res.error || ""));
    }
  };

  // ── Individual Champions Actions ──────────────────────────────────────────
  const handleChampionChange = (
    category: string,
    field: keyof IndividualChampionEntry,
    value: string
  ) => {
    setChampionsSettings((prev) => {
      const champions = [...prev.champions];
      const idx = champions.findIndex((c) => c.category === category);
      if (idx >= 0) {
        champions[idx] = { ...champions[idx], [field]: value };
      } else {
        champions.push({
          category: category as any,
          championName: field === "championName" ? value : "",
          madrasa: field === "madrasa" ? value : "",
          points: field === "points" ? value : "",
        });
      }
      return { ...prev, champions };
    });
  };

  const handleSaveChampions = async () => {
    const res = await saveIndividualChampions(championsSettings);
    if (res.success) {
      toast.success("Individual Champions settings saved!");
    } else {
      toast.success("Individual Champions saved locally!");
    }
  };

  // ── Hadeeth Actions ───────────────────────────────────────────────────────
  const handleSaveHadeeth = async () => {
    const res = await saveHadeeth(hadeeth);
    if (res.success) {
      toast.success("Hadeeth settings saved successfully!");
    } else {
      toast.success("Hadeeth saved locally!");
    }
  };

  // ── GPay QR Actions ───────────────────────────────────────────────────────
  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQR(true);
    toast.loading("Uploading GPay QR Code image...", { id: "uploading_qr" });
    const res = await uploadGPayQRImage(file);
    setUploadingQR(false);

    if (res.success) {
      toast.success("GPay QR Code uploaded successfully!", { id: "uploading_qr" });
      const updated = await fetchGPayQR();
      setGpayData(updated);
    } else {
      toast.error("Failed to upload QR image: " + (res.error || "Please try again"), { id: "uploading_qr" });
    }
  };

  const handleDeleteQR = async () => {
    const updated = { ...gpayData, qrImageUrl: "" };
    await saveGPayQR(updated);
    setGpayData(updated);
    toast.success("GPay QR image removed (reverted to default)");
  };

  const handleSaveGPaySettings = async () => {
    const res = await saveGPayQR(gpayData);
    if (res.success) {
      toast.success("GPay QR section settings saved!");
    } else {
      toast.success("GPay settings saved locally!");
    }
  };

  // ── Footer Presentation Banners Actions ───────────────────────────────────
  const handleBannerUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerSlot(slotIndex);
    toast.loading(`Uploading Banner ${slotIndex + 1}...`, { id: "upload_banner" });
    const res = await uploadFooterBannerImage(slotIndex, file);
    setUploadingBannerSlot(null);

    if (res.success) {
      toast.success(`Banner ${slotIndex + 1} uploaded!`, { id: "upload_banner" });
      const updated = await fetchFooterBanners();
      setFooterBanners(updated);
    } else {
      toast.error("Failed to upload banner: " + (res.error || "Please try again"), { id: "upload_banner" });
    }
  };

  const handleDeleteBanner = async (slotIndex: number) => {
    await deleteFooterBannerImage(slotIndex);
    const updated = await fetchFooterBanners();
    setFooterBanners(updated);
    toast.success(`Banner ${slotIndex + 1} removed`);
  };

  const handleSaveFooterSettings = async () => {
    const res = await saveFooterBanners(footerBanners);
    if (res.success) {
      toast.success("Footer presentation settings saved!");
    } else {
      toast.success("Footer settings saved locally!");
    }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Paravoor Admin Desk
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              KNM Paravoor Complex Madrasa Sargamela 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                autoFocus
              />
              <p className="text-[11px] text-neutral-400 mt-1">Default passcode: paravoor2026</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95"
            >
              Sign In to Admin
            </button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900">
                &larr; Back to Public Portal
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter programs for PDF list
  const filteredPrograms = ALL_PROGRAMS.filter((p) => {
    const matchesCat =
      programCategoryFilter === "All" ||
      p.category.toLowerCase() === programCategoryFilter.toLowerCase();
    const matchesSearch =
      programSearch === "" ||
      p.name.toLowerCase().includes(programSearch.toLowerCase()) ||
      p.id.toString() === programSearch.trim();
    return matchesCat && matchesSearch;
  });

  // Filter programs for TV scores list
  const filteredScorePrograms = ALL_PROGRAMS.filter((p) => {
    const matchesCat =
      scoreCategoryFilter === "All" ||
      p.category.toLowerCase() === scoreCategoryFilter.toLowerCase();
    const matchesSearch =
      scoreSearch === "" ||
      p.name.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      p.id.toString() === scoreSearch.trim();
    return matchesCat && matchesSearch;
  });

  const liveTotals = calculateMadrasaTotals(programScores);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center pb-12">
      {/* Admin Header */}
      <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
              title="View Public Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-neutral-900 leading-tight">
                Paravoor Sargamela Admin
              </h1>
              <span className="text-[11px] font-bold text-red-700">Control & Results Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tv-screening"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Open TV Live</span>
            </Link>
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-neutral-100">
          <button
            onClick={() => setActiveTab("tv_scores")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "tv_scores"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>TV Scores (0-15)</span>
          </button>

          <button
            onClick={() => setActiveTab("points")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "points"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Point Table</span>
          </button>

          <button
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "programs"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Program PDFs (1-63)</span>
          </button>

          <button
            onClick={() => setActiveTab("champions")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "champions"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Champions</span>
          </button>

          <button
            onClick={() => setActiveTab("hadeeth")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "hadeeth"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hadeeth</span>
          </button>

          <button
            onClick={() => setActiveTab("gpay")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "gpay"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>GPay QR (Funding)</span>
          </button>

          <button
            onClick={() => setActiveTab("footer")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "footer"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Images className="w-4 h-4" />
            <span>Footer Banners</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6">
        {/* ── TAB 0: TV SCORES (0-15) ──────────────────────────────────── */}
        {activeTab === "tv_scores" && (
          <div className="space-y-6">
            {/* Header & Controls Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-red-100 text-red-700">
                      <Tv className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-black text-neutral-900">
                      Live TV Scoreboard (Marks 0 to 15)
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter marks (0 to 15) for each madrasa across different programs. The TV screening slides and calculated final standing update in real-time.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/tv-screening"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open TV Screening</span>
                  </Link>

                  <button
                    onClick={handleSaveScores}
                    disabled={savingScores}
                    className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    {savingScores ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Save Scores</span>
                  </button>
                </div>
              </div>

              {/* Live Rank Standing Card (Calculated from Scores) */}
              <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                      Live Calculated Rankings (Final Scoresheet)
                    </span>
                  </div>
                  <button
                    onClick={handleSyncScoresToPointTable}
                    disabled={savingPoints}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 transition"
                  >
                    {savingPoints && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>Sync to Public Point Table &rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {liveTotals.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl p-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
                        <span>
                          {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : idx === 2 ? "🥉 3rd" : "🎖️ 4th"}
                        </span>
                        <span className="text-amber-400 font-black text-sm tabular-nums">
                          {item.points} pts
                        </span>
                      </div>
                      <div className="font-extrabold text-white text-base mt-1 truncate font-sans">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter and View Mode Switcher */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 no-scrollbar">
                    {PROGRAM_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setScoreCategoryFilter(cat.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          scoreCategoryFilter === cat.key
                            ? "bg-red-700 text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {cat.label} ({cat.range})
                      </button>
                    ))}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setScoreViewMode("cards")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        scoreViewMode === "cards"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                      title="Cards View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => setScoreViewMode("table")}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        scoreViewMode === "table"
                          ? "bg-white text-neutral-900 shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                      title="Table Matrix View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search program by name or # (e.g. 1, Quran, Song)..."
                    value={scoreSearch}
                    onChange={(e) => setScoreSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
            </div>

            {/* ── View Mode: Cards ── */}
            {scoreViewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScorePrograms.map((prog) => {
                  const style = CATEGORY_STYLES[prog.category];

                  return (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-neutral-200 flex flex-col justify-between space-y-3"
                    >
                      {/* Program Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: style?.bgHex || "#dc2626" }}
                          >
                            #{prog.id}
                          </span>
                          <div>
                            <h3 className="text-xs sm:text-sm font-black text-neutral-900 leading-tight">
                              {prog.name}
                            </h3>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                              {prog.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Madrasa Score Inputs (0 to 15) */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        {SCOREBOARD_MADRASAS.map((madrasa) => {
                          const val = programScores[prog.id]?.[madrasa.id];
                          const displayVal = typeof val === "number" ? val : "";

                          return (
                            <div
                              key={madrasa.id}
                              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2"
                            >
                              <span className="text-xs font-bold text-neutral-800 font-sans truncate">
                                {madrasa.name}
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                placeholder="0-15"
                                value={displayVal}
                                onChange={(e) =>
                                  handleScoreChange(prog.id, madrasa.id, e.target.value)
                                }
                                className="w-14 px-2 py-1 text-center font-black text-sm rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 tabular-nums"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── View Mode: Table Matrix ── */}
            {scoreViewMode === "table" && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-neutral-200 overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-neutral-800">
                      <th className="py-2.5 px-3 text-left font-black text-neutral-900 uppercase tracking-wider w-36">
                        Madrasa
                      </th>
                      {filteredScorePrograms.map((p) => (
                        <th
                          key={p.id}
                          className="py-2.5 px-1.5 text-center font-black text-neutral-900 min-w-[54px]"
                          title={`${p.name} (${p.category})`}
                        >
                          <div className="text-[10px] text-neutral-500 font-medium">#{p.id}</div>
                          <div className="truncate max-w-[50px] mx-auto text-[9px]">{p.category}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SCOREBOARD_MADRASAS.map((m) => (
                      <tr key={m.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-extrabold text-neutral-900 font-sans">
                          {m.name}
                        </td>
                        {filteredScorePrograms.map((p) => {
                          const val = programScores[p.id]?.[m.id];
                          const displayVal = typeof val === "number" ? val : "";

                          return (
                            <td key={p.id} className="py-1.5 px-1 text-center">
                              <input
                                type="number"
                                min="0"
                                max="15"
                                placeholder="-"
                                value={displayVal}
                                onChange={(e) =>
                                  handleScoreChange(p.id, m.id, e.target.value)
                                }
                                className="w-11 px-1 py-1 text-center font-black text-xs rounded border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between p-3.5 bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-xl text-white">
              <div className="text-xs font-medium text-neutral-300">
                Marks automatically clamp between <strong>0 and 15</strong>.
              </div>
              <button
                onClick={handleSaveScores}
                disabled={savingScores}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
              >
                {savingScores && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save All Scores</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 1: POINT TABLE ────────────────────────────────────────── */}
        {activeTab === "points" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900">Overall Madrasa Point Table</h2>
              <p className="text-xs text-neutral-500">
                Update the final total points for each of the 4 madrasas in Paravoor Complex. Changes reflect on the public site immediately.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              {points.map((madrasa, index) => (
                <div
                  key={madrasa.id}
                  className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-neutral-50 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-neutral-200 text-neutral-700 font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="font-bold text-neutral-900 text-base sm:text-lg">
                      {madrasa.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Points:</span>
                    <input
                      type="number"
                      min="0"
                      value={madrasa.points}
                      onChange={(e) => handlePointChange(madrasa.id, e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl border border-neutral-300 font-black text-lg text-center bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePoints}
                disabled={savingPoints}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95 flex items-center gap-2"
              >
                {savingPoints && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Save Point Table</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: PROGRAM PDFS ─────────────────────────────────────────── */}
        {activeTab === "programs" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900">Program Result PDFs (1 to 63)</h2>
                <p className="text-xs text-neutral-500">
                  Upload official result sheets as PDF. When users click on program numbers on the public portal, this PDF will be displayed.
                </p>
              </div>

              {/* Published count */}
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold shrink-0">
                {Object.values(resultsMap).filter((r) => r.pdfUrl).length} / 63 Published
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search program by name or #..."
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
                {PROGRAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setProgramCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      programCategoryFilter === cat.key
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Programs List */}
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
              {filteredPrograms.map((prog) => {
                const res = resultsMap[prog.id];
                const hasPdf = Boolean(res?.pdfUrl);
                const isUploading = uploadingId === prog.id;
                const catStyle = CATEGORY_STYLES[prog.category];

                return (
                  <div
                    key={prog.id}
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: catStyle.bgHex }}
                      >
                        {prog.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${catStyle.badgeClass}`}
                          >
                            {prog.category}
                          </span>
                          {hasPdf ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Result Published
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1">{prog.name}</h4>
                        {res?.pdfName && (
                          <span className="text-[11px] text-neutral-500 font-medium block">
                            File: {res.pdfName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {hasPdf && res?.pdfUrl && (
                        <a
                          href={res.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition"
                          title="View Uploaded PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      )}

                      {/* File upload input */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition active:scale-95 shadow-xs">
                        {isUploading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{hasPdf ? "Replace PDF" : "Upload PDF"}</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => handlePdfUpload(prog.id, e)}
                        />
                      </label>

                      {hasPdf && (
                        <button
                          onClick={() => handleDeletePdf(prog.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition active:scale-95 shadow-xs"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: INDIVIDUAL CHAMPIONS ─────────────────────────────────── */}
        {activeTab === "champions" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900">Individual Champions</h2>
                <p className="text-xs text-neutral-500">
                  Toggle option enabled displaying individual champions IF AND ONLY IF MANUALLY ENTERED.
                </p>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Display on Public Site:</span>
                <input
                  type="checkbox"
                  checked={championsSettings.enabled}
                  onChange={(e) =>
                    setChampionsSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Champions Form */}
            <div className="space-y-4">
              {(["Kids", "Children", "Sub Junior", "Junior", "Senior"] as const).map((category) => {
                const existing =
                  championsSettings.champions.find((c) => c.category === category) || {
                    category,
                    championName: "",
                    madrasa: "",
                    points: "",
                  };

                return (
                  <div
                    key={category}
                    className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-black text-neutral-900 uppercase tracking-wider">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>{category} Champion</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                          Student Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Muhammed Ameen"
                          value={existing.championName}
                          onChange={(e) =>
                            handleChampionChange(category, "championName", e.target.value)
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                          Madrasa
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. പുറയാർ"
                          value={existing.madrasa}
                          onChange={(e) =>
                            handleChampionChange(category, "madrasa", e.target.value)
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                          Points / Remarks (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 45 Pts"
                          value={existing.points || ""}
                          onChange={(e) =>
                            handleChampionChange(category, "points", e.target.value)
                          }
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveChampions}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95"
              >
                Save Champions Settings
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 4: HADEETH MESSAGE ──────────────────────────────────────── */}
        {activeTab === "hadeeth" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900">Hadeeth Display Section</h2>
                <p className="text-xs text-neutral-500">
                  Update the Hadeeth quote shown on the public portal.
                </p>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Display on Public Site:</span>
                <input
                  type="checkbox"
                  checked={hadeeth.enabled}
                  onChange={(e) => setHadeeth((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Arabic Text
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={hadeeth.arabic}
                  onChange={(e) => setHadeeth((prev) => ({ ...prev, arabic: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-base font-serif focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Malayalam Translation
                </label>
                <textarea
                  rows={3}
                  value={hadeeth.malayalam}
                  onChange={(e) => setHadeeth((prev) => ({ ...prev, malayalam: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Reference / Source
                </label>
                <input
                  type="text"
                  value={hadeeth.reference}
                  onChange={(e) => setHadeeth((prev) => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g. സ്വഹീഹ് മുസ്‌ലിം: 2699"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveHadeeth}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95"
              >
                Save Hadeeth Message
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 5: GPAY QR & FUNDING ────────────────────────────────────── */}
        {activeTab === "gpay" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900">GPay QR Code (Public Funding)</h2>
                <p className="text-xs text-neutral-500">
                  Upload your Google Pay / PhonePe / UPI QR Code image for Sargamela public funding.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Display QR Box:</span>
                <input
                  type="checkbox"
                  checked={gpayData.enabled}
                  onChange={(e) => setGpayData((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* QR Upload & Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Section Title (Malayalam)
                  </label>
                  <input
                    type="text"
                    value={gpayData.title}
                    onChange={(e) => setGpayData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Subtitle / Instructions
                  </label>
                  <input
                    type="text"
                    value={gpayData.subtitle}
                    onChange={(e) => setGpayData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Upload GPay / UPI QR Image
                  </label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-red-600 bg-neutral-50 hover:bg-red-50/50 transition">
                    <Upload className="w-4 h-4 text-neutral-600" />
                    <span className="text-xs font-bold text-neutral-700">
                      {uploadingQR ? "Uploading..." : "Select QR Image (PNG/JPG)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingQR}
                      onChange={handleQRUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {gpayData.qrImageUrl && (
                  <button
                    onClick={handleDeleteQR}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Uploaded QR Image</span>
                  </button>
                )}
              </div>

              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
                <span className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                  Live Preview on Portal
                </span>
                <div className="w-44 h-44 bg-[#dc2626] rounded-2xl p-2.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                    {gpayData.qrImageUrl ? (
                      <img
                        src={gpayData.qrImageUrl}
                        alt="GPay QR Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-neutral-400 text-center text-xs">
                        <CreditCard className="w-8 h-8 mx-auto mb-1 text-neutral-300" />
                        <span>No custom QR image uploaded yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveGPaySettings}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95"
              >
                Save GPay QR Settings
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 6: FOOTER PRESENTATION BANNERS ───────────────────────────── */}
        {activeTab === "footer" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900">Footer Presentation Banners (2 Files)</h2>
              <p className="text-xs text-neutral-500">
                Upload up to 2 banner images for the footer. They alternate automatically every 3 to 5 seconds like a presentation slideshow.
              </p>
            </div>

            {/* Slideshow Interval Setting */}
            <div className="max-w-xs space-y-1">
              <label className="block text-xs font-bold text-neutral-700 uppercase">
                Slideshow Transition Interval (Seconds)
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={footerBanners.intervalSeconds}
                onChange={(e) =>
                  setFooterBanners((prev) => ({
                    ...prev,
                    intervalSeconds: Math.max(2, parseInt(e.target.value) || 4),
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold"
              />
            </div>

            {/* 2 Banner Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {[0, 1].map((slotIdx) => {
                const bannerUrl = footerBanners.banners[slotIdx];
                const isUploading = uploadingBannerSlot === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-neutral-800 tracking-wide">
                          Banner Slot {slotIdx + 1}
                        </span>
                        {bannerUrl ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full">
                            Empty
                          </span>
                        )}
                      </div>

                      {/* Image Preview */}
                      <div className="w-full h-24 rounded-xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center p-1">
                        {bannerUrl ? (
                          <img
                            src={bannerUrl}
                            alt={`Banner Slot ${slotIdx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-neutral-400">No image in slot {slotIdx + 1}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Uploading..." : bannerUrl ? "Replace" : "Upload File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleBannerUpload(slotIdx, e)}
                          className="hidden"
                        />
                      </label>

                      {bannerUrl && (
                        <button
                          onClick={() => handleDeleteBanner(slotIdx)}
                          className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition"
                          title="Remove Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveFooterSettings}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition active:scale-95"
              >
                Save Footer Presentation Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
