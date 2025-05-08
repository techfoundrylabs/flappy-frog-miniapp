import { FlappyBirdComponent } from "@/app/_components/FlappyBirdComponent";
import { Loading } from "@/app/_components/loading";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";

import { useEffect } from "react";

export const Game = () => {
  const { context } = useMiniKit();

  const addFrame = useAddFrame();

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
  const displayName = context.user.username ?? context.user.fid.toString();

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyBirdComponent fid={fid} displayName={displayName} />
    </div>
  );
};
