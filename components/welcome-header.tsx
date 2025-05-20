import { Loading } from "@/components/loading";
import { useChain } from "@/hooks/use-chain";
import { useDateEndOfGame } from "@/hooks/use-game-info";
import { useGetTreasury } from "@/hooks/use-smart-contracts";

export const WelcomeHeader = () => {
  const { chainName } = useChain();
  const { treasuryValue } = useGetTreasury();
  const { dateEndOfGamePlusOneDay, isLoading } = useDateEndOfGame();

  if (isLoading) return <Loading />;

  return (
    <div className="w-full flex flex-col px-2 text-white/90  text-center py-4 md:pt-2">
      <span className="text-sm md:text-base">
        Treasury value({chainName}): {parseFloat(treasuryValue).toFixed(4)} ETH
      </span>
      <span className="text-xs">
        Next winner announced {dateEndOfGamePlusOneDay}
      </span>
    </div>
  );
};
