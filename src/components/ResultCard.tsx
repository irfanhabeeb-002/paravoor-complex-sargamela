import { Result } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal, Award, Trophy } from "lucide-react";

interface ResultCardProps {
  result: Result;
  showProgram?: boolean;
  winnerCertificateUrl?: string;
  overrideRank?: string | null;
  overrideGrade?: string | null;
}

export const ResultCard = ({ result, showProgram = false, winnerCertificateUrl, overrideRank, overrideGrade }: ResultCardProps) => {
  // Use override values if provided, otherwise fall back to result values
  const displayRank = overrideRank || result.rank;
  const displayGrade = overrideGrade || result.grade;

  const getRankIcon = () => {
    if (!displayRank) return null;
    switch (displayRank) {
      case "1st":
      case "1":
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case "2nd":
      case "2":
        return <Medal className="h-5 w-5 text-slate-500" />;
      case "3rd":
      case "3":
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeStyle = () => {
    if (!displayRank) return "bg-gray-100 text-gray-700 border-gray-300";
    switch (displayRank) {
      case "1st":
      case "1":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-500 font-bold shadow-sm";
      case "2nd":
      case "2":
        return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 border-slate-400 font-semibold shadow-sm";
      case "3rd":
      case "3":
        return "bg-gradient-to-r from-orange-300 to-amber-400 text-orange-900 border-orange-400 font-semibold shadow-sm";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Card className="p-4 sm:p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            {getRankIcon()}
            <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">{result.participantName}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">{result.madrasaName}</p>
          {showProgram && (
            <p className="text-xs text-muted-foreground break-words">
              Program {result.programId}: {result.programName}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {displayRank && (
              <Badge className={`text-xs sm:text-sm border ${getRankBadgeStyle()}`}>
                Rank {displayRank}
              </Badge>
            )}
            {displayGrade && displayGrade !== "NA" && displayGrade !== "-" && (
              <Badge variant="outline" className="text-xs sm:text-sm">Grade {displayGrade}</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {result.category}
            </Badge>
          </div>
          {winnerCertificateUrl && displayRank && (
            <a
              href={winnerCertificateUrl}
              download
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              Download Winner Certificate
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
