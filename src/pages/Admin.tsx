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
  fetchQRCodeSettings,
  saveQRCodeSettings,
  ChampionsSettings,
  QRCodeSettings,
} from "@/lib/dataService";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  MadrasaPointEntry,
  PARAVOOR_MADRASAS,
  DEFAULT_HADEETH,
  HadeethData,
  ProgramResultEntry,
  IndividualChampionEntry,
} from "@/data/paravoorData";
import { ALL_PROGRAMS, PROGRAM_CATEGORIES, SargamelaProgram } from "@/data/programsData";
import { toast } from "sonner";
import {
  Trophy,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Crown,
  BookOpen,
  Database,
  QrCode,
  ArrowLeft,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";

const ADMIN_PASSCODE = "paravoor2026";
const AUTH_STORAGE_KEY = "paravoor_admin_authenticated";

export const AdminPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [passcodeInput, setPasscodeInput] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState<
    "points" | "programs" | "champions" | "hadeeth" | "supabase"
  >("points");

  // State data
  const [points, setPoints] = useState<MadrasaPointEntry[]>(PARAVOOR_MADRASAS);
  const [resultsMap, setResultsMap] = useState<Record<number, ProgramResultEntry>>({});
  const [hadeeth, setHadeeth] = useState<HadeethData>(DEFAULTHadeeth());
  const [championsSettings, setChampionsSettings] = useState<ChampionsSettings>({
    enabled: false,
    champions: [],
  });
  const [qrSettings, setQrSettings] = useState<QRCodeSettings>({
    url: "https://paravoor-complex-sargamela.netlify.app/",
    enabled: true,
  });

  // Supabase config state
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  // Program filters & upload
  const [programSearch, setProgramSearch] = useState("");
  const [programCategoryFilter, setProgramCategoryFilter] = useState("All");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [savingPoints, setSavingPoints] = useState(false);

  function DEFAULTHadeeth(): HadeethData {
    return DEFAULT_HADEETH;
  }

  // Load data
  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
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
      setChampionsSettings(champ);
      setQrSettings(qr);

      const cfg = getSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseKey(cfg.anonKey);
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

  // ── Points Actions ────────────────────────────────────────────────────────
  const handlePointChange = (id: string, value: string) => {
    const numeric = parseInt(value, 10);
    setPoints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, points: isNaN(numeric) ? 0 : numeric } : item))
    );
  };

  const handleSavePoints = async () => {
    setSavingPoints(true);
    const res = await saveMadrasaPoints(points);
    setSavingPoints(false);
    if (res.success) {
      toast.success("Point table updated successfully!");
    } else {
      toast.error("Failed to sync to Supabase: " + res.error);
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
    if (!confirm(`Are you sure you want to remove the result PDF for Program #${programId}?`)) {
      return;
    }

    const res = await deleteProgramPdf(programId);
    if (res.success) {
      toast.success(`Result PDF removed for Program #${programId}`);
      const updated = await fetchProgramResults();
      setResultsMap(updated);
    } else {
      toast.error("Failed to delete result PDF");
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
      toast.error("Failed to save champions: " + res.error);
    }
  };

  // ── Hadeeth Actions ───────────────────────────────────────────────────────
  const handleSaveHadeeth = async () => {
    const res = await saveHadeeth(hadeeth);
    if (res.success) {
      toast.success("Hadeeth settings saved successfully!");
    } else {
      toast.error("Failed to save hadeeth: " + res.error);
    }
  };

  // ── Supabase & Settings ───────────────────────────────────────────────────
  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    toast.success("Supabase credentials saved locally!");
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus("testing");
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseStatus("error");
      toast.error("Please enter valid Supabase URL and Key");
      return;
    }

    try {
      const { data, error } = await client.from("madrasa_points").select("id").limit(1);
      if (error) {
        setSupabaseStatus("error");
        toast.error(`Supabase connection error: ${error.message}`);
      } else {
        setSupabaseStatus("success");
        toast.success("Connected to Supabase successfully!");
      }
    } catch (err: any) {
      setSupabaseStatus("error");
      toast.error(`Connection failed: ${err.message}`);
    }
  };

  const handleSaveQr = async () => {
    const res = await saveQRCodeSettings(qrSettings);
    if (res.success) {
      toast.success("QR Code settings saved!");
    } else {
      toast.error("Failed to save QR settings");
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
            <span>Individual Champions</span>
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
            <span>Hadeeth Message</span>
          </button>

          <button
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "supabase"
                ? "border-red-600 text-red-700"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Settings</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6">
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
              {points.map((madrasa) => (
                <div
                  key={madrasa.id}
                  className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-neutral-50 border border-neutral-200"
                >
                  <div className="font-bold text-neutral-900 text-base sm:text-lg">
                    {madrasa.name}
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

                return (
                  <div
                    key={prog.id}
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#8cc63f] text-neutral-900 font-black text-sm flex items-center justify-center shrink-0">
                        {prog.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                            {prog.category}
                          </span>
                          {hasPdf ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Result Published
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1">{prog.name}</h4>
                        {res?.pdfName && (
                          <span className="text-[11px] text-neutral-400 font-medium block">
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
                          className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                          title="View Uploaded PDF"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* File upload input */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition active:scale-95">
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
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-4 h-4" />
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

        {/* ── TAB 5: SUPABASE & SETTINGS ──────────────────────────────────── */}
        {activeTab === "supabase" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200 space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900">Supabase & Portal Settings</h2>
              <p className="text-xs text-neutral-500">
                Connect your Supabase project for real-time PDF storage, point table sync, and global state.
              </p>
            </div>

            {/* Supabase Connection Form */}
            <div className="space-y-4 max-w-xl p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Supabase Database & Storage Credentials</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveSupabase}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Save Credentials
                </button>
                <button
                  onClick={handleTestSupabase}
                  disabled={supabaseStatus === "testing"}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {supabaseStatus === "testing" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Test Connection</span>
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
                <p>
                  <strong>Tip:</strong> Run the provided <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono">supabase_schema.sql</code> in your Supabase SQL Editor to automatically create tables and the storage bucket!
                </p>
              </div>
            </div>

            {/* QR Code Settings */}
            <div className="space-y-4 max-w-xl p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <QrCode className="w-4 h-4 text-red-600" />
                  <span>Portal QR Code Settings</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-600">Show on Site:</span>
                  <input
                    type="checkbox"
                    checked={qrSettings.enabled}
                    onChange={(e) =>
                      setQrSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  QR Destination URL
                </label>
                <input
                  type="text"
                  value={qrSettings.url}
                  onChange={(e) => setQrSettings((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://paravoor-complex-sargamela.netlify.app/"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                onClick={handleSaveQr}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition"
              >
                Save QR Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
