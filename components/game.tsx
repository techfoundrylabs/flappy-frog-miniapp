import { FlappyFrog } from "@/components/flappy-frog";
import { Loading } from "@/components/loading";
import { useEventHandler } from "@/hooks/use-event-handler";
import { useDateEndOfGame } from "@/hooks/use-game-info";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";
import { useDepositIntoTreasury } from "@/hooks/use-smart-contracts";

interface GameProps {
  fid: number;
  displayName: string;
}

export const Game = ({ fid, displayName }: GameProps) => {
  useEventHandler();

  const { address, isConnected } = useMiniappWallet();

  const { handlePayGame } = useDepositIntoTreasury();
  const { isSuccess: isSuccessRetrieveDate } = useDateEndOfGame();

  if (!isConnected || !address || !isSuccessRetrieveDate) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrog fid={fid} displayName={displayName} pay={handlePayGame} />
    </div>
  );
};
