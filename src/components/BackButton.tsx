import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackTo?: string;
  label?: string;
  className?: string;
  forceDirectNavigation?: boolean;
}

export function BackButton({
  fallbackTo = "/",
  label = "Back",
  className,
  forceDirectNavigation = false,
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const isResultsWithParams =
      location.pathname === "/results" && location.search.length > 0;

    if (forceDirectNavigation || isResultsWithParams) {
      navigate(fallbackTo);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/80 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-900 shadow-sm",
        "hover:bg-white hover:border-black/20 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
        "transition-all duration-200 active:scale-95",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      <span>{label}</span>
    </button>
  );
}
