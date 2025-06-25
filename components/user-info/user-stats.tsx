import { shareCast } from "@/lib/event-bus/event-actions";
import { Share2 } from "lucide-react";

interface UserStatsProps {
  avatar: string | undefined;
  score: number | undefined;
  rank: number | undefined;
  attempts: number | undefined;
}

export const UserStats = ({
  avatar,
  score,
  rank,
  attempts,
}: UserStatsProps) => {
  const realScore = score ?? 0;
  const realRank = typeof rank === "number" && rank >= 0 ? rank + 1 : -1;
  const realAttempts = attempts ?? 0;
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
      <span className="text-white text-[12px] mb-4">Flappy Frog Stats</span>

      <div className="mt-2 space-y-4">
        {/* Current Score with Share */}
        <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-lg  text-yellow-400">{realScore}</p>
              <p className="text-blue-200 text-[10px]">Current Score</p>
            </div>

            <button
              onClick={() =>
                shareCast(
                  avatar,
                  realScore,
                  realRank >= 0 ? realRank : undefined,
                )
              }
              className="bg-blue-500/50 hover:bg-blue-500/70 text-white p-2 rounded-lg transition-colors"
              title="Share Current Score"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Rank and Attempts Left */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
            <p className="text-lg  text-yellow-400">
              {realRank >= 0 ? `#${realRank}` : "-"}
            </p>
            <p className="text-blue-200 text-[10px]">Current Rank</p>
          </div>
          <div className="text-center bg-yellow-500/20 rounded-xl p-4 border border-yellow-400/30">
            <p className="text-lg font-bold text-yellow-400">{realAttempts}</p>
            <p className="text-blue-200 text-[10px]">Attempts Left</p>
          </div>
        </div>
      </div>
    </div>
  );
};
