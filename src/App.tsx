import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminPage from "./pages/Admin";
import TvScreening from "./pages/TvScreening";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Handle direct access to /tv-screening without hash on Netlify
if (
  typeof window !== "undefined" &&
  window.location.pathname.includes("tv-screening") &&
  !window.location.hash.includes("tv-screening")
) {
  window.location.replace("/#/tv-screening");
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-center" />
      <HashRouter>
        <Routes>
          {/* Public Sargamela Portal */}
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Navigate to="/" replace />} />

          {/* Live Casting to TV (32 inch & 40 inch) */}
          <Route path="/tv-screening" element={<TvScreening />} />

          {/* Secret Obfuscated Admin Route */}
          <Route path="/pvr-control-desk-9482" element={<AdminPage />} />

          {/* Obscure standard admin routes by redirecting to home */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
