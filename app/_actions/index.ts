"use server";

import { env } from "@/app/env";
import {
  getUserGamePlay,
  setTTL,
  setUserGamePlay,
} from "@/lib/redis/game-play";

const MAX_USER_HEARTS = env.MAX_HEARTS;

export const getMaxUserHearts = async () => MAX_USER_HEARTS;

export const initGame = async (fid: number) => {
  try {
    const hearts = await getUserGamePlay(fid);
    if (!hearts) {
      const res = await setUserGamePlay(fid, MAX_USER_HEARTS);
      if (res === "OK") {
        setTTL(fid);
        return MAX_USER_HEARTS;
      }
    }

    return hearts;
  } catch (error) {
    console.error(error);
  }
};
