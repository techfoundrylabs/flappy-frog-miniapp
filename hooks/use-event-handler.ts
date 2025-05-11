import { refillHearts } from "@/actions";
import { useMiniappWallet } from "@/hooks/use-miniapp-wallet";
import { EventBus } from "@/lib/event-bus";
import { shareCast } from "@/lib/event-bus/event-actions";
import { useCallback, useEffect } from "react";

export const useEventHandler = () => {
  const { pay, isSuccessTrx, context, refetch } = useMiniappWallet();

  const handleRefillHeart = useCallback(async () => {
    if (!!context) {
      await refetch();
      await refillHearts(context.user.fid);
    }
  }, [context, refetch]);

  useEffect(() => {
    if (isSuccessTrx) {
      handleRefillHeart();
    }

    EventBus.on("share", async (score: number) => await shareCast(score));
    EventBus.on("pay", async () => await pay());

    return () => {
      EventBus.removeAllListeners();
    };
  }, [handleRefillHeart, isSuccessTrx, pay]);
};
