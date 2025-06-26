import { EventBus } from "@/lib/event-bus";
import { shareCastPoint } from "@/lib/event-bus/event-actions";
import { useMiniApp } from "@/providers/mini-app-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useEventHandler = () => {
  const { setAnimateOut, fid } = useMiniApp();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== undefined) {
      EventBus.on(
        "share",
        async (score: number) => await shareCastPoint(fid, score),
      );
      EventBus.on("play-game", () => setAnimateOut(true));
      EventBus.on("game-over", () => setAnimateOut(false));
      EventBus.on("go-to-shop", () => router.push("/shop"));

      return () => {
        EventBus.removeAllListeners();
      };
    }
  }, [fid, router, setAnimateOut]);
};
