import { playGame } from "@/lib/flappy-base";
import {
  useMiniKit,
  useAddFrame,
  useNotification,
} from "@coinbase/onchainkit/minikit";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

export const HomeGame = () => {
  const { context } = useMiniKit();

  const addFrame = useAddFrame();
  const router = useRouter();

  const handleBtnPlay = async () => {
    try {
      if (!context) throw new Error("");

      const fid = context.user.fid;

      const hearts = await playGame(fid);
      if (hearts > 0) router.push("/game");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : error;
      console.error(errorMsg);
    }
  };

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

  const sendNotification = useNotification();

  const handleSendNotification = async () => {
    try {
      await sendNotification({
        title: "New High Score! 🎉",
        body: "Congratulations on achieving a new high score!",
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-y-4">
      <h1>HOME</h1>

      {context?.client.added && (
        <button
          type="button"
          onClick={handleSendNotification}
          className="w-fit p-2 bg-blue-400 text-lg rounded-md"
        >
          SEND NOTIFICATION
        </button>
      )}

      <div className="w-full md:w-1/2 flex justify-between px-0 md:px-44 ">
        <button
          onClick={handleBtnPlay}
          className="w-fit p-2 bg-blue-400 text-lg rounded-md"
        >
          PLAY
        </button>
        <Link href={"/ranking"}>
          <button
            onClick={handleBtnPlay}
            className="w-fit p-2 bg-blue-400 text-lg rounded-md"
          >
            RANKING
          </button>
        </Link>
      </div>
    </div>
  );
};
