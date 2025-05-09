"use client";

import { FlappyFrogComponent } from "@/app/_components/FlappyFrogComponent";
import { Loading } from "@/app/_components/loading";
import { EventBus } from "@/lib/event-bus";
import { shareCast } from "@/lib/event-bus/event-actions";
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

  useEffect(() => {
    const handleShare = async (score: number) => {
      try {
        await shareCast(score);
      } catch (error) {
        console.error("Error sharing score: ", error);
      }
    };

    EventBus.on("share", (score: number) => handleShare(score));

    return () => {
      EventBus.removeAllListeners();
    };
  }, []);

  if (!context) return <Loading />;

  const fid = context.user.fid;
  const displayName = context.user.username ?? context.user.fid.toString();

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 text-xs">
      <FlappyFrogComponent fid={fid} displayName={displayName} />
    </div>
  );
};
