import { EventBus } from "@/lib/event-bus";
import { shareCast } from "@/lib/event-bus/event-actions";

export const useEventHandler = () => {
  EventBus.on("share", async (score: number) => await shareCast(score));

  return () => {
    EventBus.removeAllListeners();
  };
};
