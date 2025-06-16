import { BaseLayout } from "@/components/menu/base-layout";

import { Medal, Award, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  change: number;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    username: "CryptoKing99",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 15420,
    change: 2,
  },
  {
    rank: 2,
    username: "BlockMaster",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 14890,
    change: -1,
  },
  {
    rank: 3,
    username: "PF55351",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 14250,
    change: 1,
  },
  {
    rank: 4,
    username: "ChainHero",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 13780,
    change: 0,
  },
  {
    rank: 5,
    username: "TokenMaster",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 13420,
    change: 3,
  },
  {
    rank: 6,
    username: "DeFiPro",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 12950,
    change: -2,
  },
  {
    rank: 7,
    username: "Web3Wizard",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 12680,
    change: 1,
  },
  {
    rank: 8,
    username: "NFTCollector",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 12340,
    change: -1,
  },
  {
    rank: 9,
    username: "MetaGamer",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 11890,
    change: 2,
  },
  {
    rank: 10,
    username: "CoinHunter",
    avatar: "/placeholder.svg?height=50&width=50",
    score: 11560,
    change: 0,
  },
];

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

const RankingPage = () => {
  return (
    <BaseLayout title="Top Players" className="py-8 mb-20">
      <div className="space-y-3 w-full mx-auto">
        {mockLeaderboardData.map((player, index) => (
          <div
            key={player.username}
            className={`
              backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20
              ${player.rank <= 3 ? "bg-gradient-to-r from-white/20 to-white/10 border-white/30" : ""}
              ${player.username === "PF55351" ? "ring-2 ring-yellow-400/50 bg-gradient-to-r from-yellow-400/20 to-white/10" : ""}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">{getRankIcon(player.rank)}</div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={player.avatar || "/placeholder.svg"}
                  alt={player.username}
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white  text-[12px] truncate">
                    {player.username}
                  </h3>
                  {player.username === "PF55351" && (
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
    </BaseLayout>
  );
};

export default RankingPage;
