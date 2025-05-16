import { FlappyFrog } from "@/components/flappy-frog";
import { Loading } from "@/components/loading";
import { useEventHandler } from "@/hooks/use-event-handler";
import { useDateEndOfGame } from "@/hooks/use-game-info";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";
import {
  useDepositIntoTreasury,
  useGetTreasury,
} from "@/hooks/use-smart-contracts";

export const Game = () => {
  useEventHandler();

  const { chainName, address, isConnected, context, getWalletBalance } =
    useMiniappWallet();
  const { handlePayGame } = useDepositIntoTreasury();
  const { getTreasuryValue } = useGetTreasury();
  const { dateEndOfGame } = useDateEndOfGame();

  if (!context || !isConnected || !address) return <Loading />;

  const fid = context.user.fid;
  const userName = context.user.username ?? "";

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrog
        fid={fid}
        displayName={userName}
        address={address}
        chainName={chainName}
        dateEndOfGame={dateEndOfGame}
        getWalletBalance={getWalletBalance}
        getTreasuryValue={getTreasuryValue}
        pay={handlePayGame}
      />
    </div>
  );
};
