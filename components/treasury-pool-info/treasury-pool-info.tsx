"use client";
import { useCountdown } from "@/hooks/use-countdown";
import { useGetTreasuryPoolData } from "@/hooks/use-smart-contracts";
import { Clock, Crown } from "lucide-react";

export const TreasuryPoolInfo = () => {
  const { formattedTreasury, gameEndMs } = useGetTreasuryPoolData();
  const { timeLeftFormatted } = useCountdown(gameEndMs);

  return (
    <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 rounded-2xl p-6 border-2 border-purple-400/50 shadow-xl mt-6">
      <div className="text-center">
        {/* Pool Amount */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-emerald-400 font-black text-lg">
            {Number(formattedTreasury).toFixed(8)} ETH
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="bg-black/40 rounded-xl p-4 border border-purple-300/30">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Clock className="w-4 h-4 text-purple-200" />
            <span className="text-purple-200 text-[10px]">
              Next Distribution
            </span>
          </div>

          <div className="text-white font-black text-[10px]">
            {timeLeftFormatted}
          </div>
        </div>

        {/* Winner Takes All */}
        <div className="mt-4">
          <div className="bg-gradient-to-r from-yellow-500/40 to-amber-500/40 rounded-xl p-4 border-2 border-yellow-400/60">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crown className="w-4 h-4 text-yellow-300" />
              <span className="text-yellow-200 text-[10px]">
                WINNER TAKES ALL
              </span>
              <Crown className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-yellow-100 font-black text-base">100%</div>
            <div className="text-yellow-200 text-xs">1st Place Winner</div>
          </div>
        </div>

        {/* Pool Info */}
        <p className="text-purple-100 text-[10px] mt-4 leading-relaxed">
          🏆 Weekly prize goes entirely to #1 player
          <br />
          💰 Pool grows with every game purchase
          <br />
          👑 Winner takes the full treasury!
        </p>
      </div>
    </div>
  );
};
