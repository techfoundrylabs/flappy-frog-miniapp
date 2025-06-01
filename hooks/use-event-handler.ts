import { EventBus } from "@/lib/event-bus";
import { shareCast } from "@/lib/event-bus/event-actions";
import { useMiniApp } from "@/providers/mini-app-provider";
import { useEffect } from "react";

export const useEventHandler = () => {
  const { setAnimateOut } = useMiniApp();

  useEffect(() => {
    if (typeof window !== undefined) {
      EventBus.on("share", async (score: number) => await shareCast(score));
      EventBus.on("play-game", () => setAnimateOut(true));
      EventBus.on("game-over", () => setAnimateOut(false));

      return () => {
        EventBus.removeAllListeners();
      };
    }
  }, [setAnimateOut]);
};
