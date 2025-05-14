import { FlappyFrog } from "@/components/flappy-frog";
import { Loading } from "@/components/loading";
import { useEventHandler } from "@/hooks/use-event-handler";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";
import {
  useDepositIntoTreasury,
  useGetTreasury,
} from "@/hooks/use-smart-contracts";

export const Game = () => {
  useEventHandler();

  const { address, isConnected, context , getWalletBalance} =
    useMiniappWallet();
  const { handlePayGame } = useDepositIntoTreasury();
  const { getTreasuryValue } = useGetTreasury();

  if (!context || !isConnected || !address) return <Loading />;

  const fid = context.user.fid;
  const userName = context.user.username ?? "";

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrog
        fid={fid}
        displayName={userName}
        address={address}
        getWalletBalance={getWalletBalance}
        getTreasuryValue={getTreasuryValue}
        pay={handlePayGame}
      />
    </div>
  );
};
