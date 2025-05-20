import { FlappyFrog } from "@/components/flappy-frog";
import { Loading } from "@/components/loading";
import { useChain } from "@/hooks/use-chain";
import { useEventHandler } from "@/hooks/use-event-handler";
import { useDateEndOfGame } from "@/hooks/use-game-info";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";
import {
  useDepositIntoTreasury,
  useGetTreasury,
} from "@/hooks/use-smart-contracts";
import { useWalletClient } from "wagmi";

export const Game = () => {
  useEventHandler();

  const { address, isConnected, context, getWalletBalance } =
    useMiniappWallet();

  const { handlePayGame } = useDepositIntoTreasury();
  const { getTreasuryValue } = useGetTreasury();
  const { dateEndOfGameUnix, isSuccess: isSuccessRetrieveDate } =
    useDateEndOfGame();
  const { chainName } = useChain();
  const { data } = useWalletClient();
  console.log("========>", data?.account);

  if (!context || !isConnected || !address || !isSuccessRetrieveDate)
    return <Loading />;

  const fid = context.user.fid;
  const userName = context.user.username ?? "";

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrog
        fid={fid}
        displayName={userName}
        address={address}
        chainName={chainName}
        dateEndOfGame={dateEndOfGameUnix}
        getWalletBalance={getWalletBalance}
        getTreasuryValue={getTreasuryValue}
        pay={handlePayGame}
      />
    </div>
  );
};
