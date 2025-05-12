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

  const { address, formattedBalance, isConnected, context } =
    useMiniappWallet();
  const { handlePayGame } = useDepositIntoTreasury();
  const { treasuryAmountFormatted } = useGetTreasury();

  if (!context || !isConnected || !address) return <Loading />;

  const fid = context.user.fid;
  const userName = context.user.username ?? "";

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrog
        fid={fid}
        displayName={userName}
        address={address}
        formattedBalance={formattedBalance}
        treasuryValue={treasuryAmountFormatted}
        pay={handlePayGame}
      />
    </div>
  );
};
