import { FlappyFrog } from "@/components/flappy-frog";
import { Loading } from "@/components/loading";
import { useEventHandler } from "@/hooks/use-event-handler";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";

export const Game = () => {
  useEventHandler();

  const { pay, address, formattedBalance, isConnected, context } =
    useMiniappWallet();

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
        pay={pay}
      />
    </div>
  );
};
