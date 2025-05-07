import { FlappyBirdComponent } from "@/app/_components/FlappyBirdComponent";
import { Loading } from "@/app/_components/loading";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { Wallet } from "@coinbase/onchainkit/wallet";

import { useEffect } from "react";
import { parseEther } from "viem";
import { useSendTransaction } from "wagmi";

export const Game = () => {
  const { context } = useMiniKit();

  const addFrame = useAddFrame();

  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    const checkFrameAndAdd = async () => {
      try {
        await addFrame();
      } catch (error) {
        console.warn("addFrame was rejected by the user", error);
      }
    };

    if (!context?.client.added) {
      checkFrameAndAdd();
    }
  }, [addFrame, context]);

  if (!context) return <Loading />;

  const fid = context.user.fid;
  const displayName = context.user.displayName ?? context.user.username;

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <div className="flex w-full justify-between">
        <span>{displayName}</span>
        <Wallet draggable={true} />

        <button
          onClick={() =>
            sendTransaction({
              to: "0xd2135CfB216b74109775236E36d4b433F1DF507B",
              value: parseEther("0.01"),
            })
          }
        >
          PAY
        </button>
      </div>
      <FlappyBirdComponent fid={fid} />
    </div>
  );
};
