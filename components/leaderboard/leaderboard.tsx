"use client";
import { TopPlayers } from "@/actions";
import { useMiniApp } from "@/providers/mini-app-provider";
import { useViewProfile } from "@coinbase/onchainkit/minikit";
import { /* Medal, Award, */ Crown } from "lucide-react";
import Image from "next/image";

interface LeaderboardProps {
  topPlayers: TopPlayers | undefined;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    /*     case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />; */
    default:
      return (
        <span className="w-4 h-4 flex items-center justify-center text-white  text-[12px]">
          #{rank}
        </span>
      );
  }
};

export const Leaderboard = ({ topPlayers }: LeaderboardProps) => {
  const { userName } = useMiniApp();
  const viewUserProfile = useViewProfile();
  return (
    <div className="space-y-3 w-full mx-auto">
      <h1 className="uppercase text-lg text-center text-white/90">
        Top 10 Players
      </h1>

      {topPlayers &&
        topPlayers.map((player, index) => (
          <div
            key={player.name}
            className={`
              backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20
              ${index + 1 <= 3 ? "bg-gradient-to-r from-white/20 to-white/10 border-white/30" : ""}
              ${player.name === userName ? "ring-2 ring-yellow-400/50 bg-gradient-to-r from-yellow-400/20 to-white/10" : ""}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>

              {/* Avatar */}
              <div
                className="flex-shrink-0"
                onClick={() => viewUserProfile(player.fid)}
              >
                <Image
                  src={player.avatar}
                  alt={player.name}
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                  width={"48"}
                  height={"48"}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white  text-[12px] truncate">
                    {player.name}
                  </h3>
                  {player.name === userName && (
                    <span className="text-yellow-400 text-[10px] bg-yellow-400/20 px-2 py-1 rounded-full">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-blue-200 text-[10px]">
                  {player.score.toLocaleString()} points
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
