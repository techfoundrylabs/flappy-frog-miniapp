"use server";

import { env } from "@/app/env";
import {
  getUserGamePlay,
  setTTL,
  setUserGamePlay,
  updateLeaderboard,
  getNthTopPlayers,
  setRefillGamePlay,
  getRefillGamePlay,
  getRankingScoreAttemps,
  getTTL,
} from "@/lib/redis/game-play";

interface Player {
  fid: number;
  name: string;
  avatar: string;
  score: number;
}

interface UserRankScore {
  rank: number;
  score: number;
}

export interface UserRankScoreAttempts extends UserRankScore {
  attempts: number;
}

export type TopPlayer = Player[];

const MAX_USER_HEARTS = env.MAX_HEARTS;
const LEADERBOARD_LIMIT = 10;

export const initGame = async (fid: number) => {
  try {
    const hearts = await getUserGamePlay(fid);
    const refill = (await getRefillGamePlay(fid)) ?? 0;

    if (hearts === null) {
      const res = await setUserGamePlay(fid, MAX_USER_HEARTS);
      if (res === "OK") {
        setTTL(fid);
        return MAX_USER_HEARTS;
      }
    }

    return refill + (hearts ?? 0);
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const refillHearts = async (fid: number, attempts: number) => {
  try {
    const refill = (await getRefillGamePlay(fid)) ?? 0;
    const res = await setRefillGamePlay(fid, refill + attempts);
    if (res === "OK") {
      return attempts;
    }
  } catch (error) {
    console.error(error);
  }
};

export const decreaseHearts = async (fid: number, hearts: number) => {
  try {
    const userHearts = (await getUserGamePlay(fid)) ?? 0;
    if (userHearts > 0) await setUserGamePlay(fid, userHearts - 1);
    else await setRefillGamePlay(fid, hearts);
  } catch (error) {
    console.error(error);
  }
};

export const setScoreInLeaderboard = async (
  fid: number,
  displayName: string,
  avatar: string,
  score: number,
) => {
  try {
    return updateLeaderboard(fid, displayName, avatar, score);
  } catch (error) {
    console.error(error);
  }
};

export const getTopPlayers = async () => {
  try {
    const nthTopPlayers = await getNthTopPlayers(LEADERBOARD_LIMIT);
    return nthTopPlayers!.reduce(
      (previousValue, currentValue, currentIndex) => {
        if (currentIndex % 2 === 0) {
          const splittedValue = (currentValue as string).split("@@");
          const fid = splittedValue[0];
          const displayName = splittedValue[1];
          const avatar = splittedValue[2];
          (previousValue as Record<string, string>[]).push({
            fid,
            name: displayName,
            avatar,
            score: nthTopPlayers![currentIndex + 1] as string,
          });
        }
        return previousValue;
      },
      [],
    ) as TopPlayer;
  } catch (error) {
    console.error(error);
  }
};

export const getRankingScoreAttemptsByUser = async (userKey: string) => {
  try {
    const fid = Number(userKey.split("@@")[0]);
    const hearts = await getUserGamePlay(fid);
    const refill = (await getRefillGamePlay(fid)) ?? 0;
    const attempts = refill + (hearts ?? 0);
    const result = (await getRankingScoreAttemps(userKey)) as UserRankScore;
    return { ...result, attempts } as UserRankScoreAttempts;
  } catch (error) {
    console.error(error);
  }
};

export const getTimeToAutoRefill = async (fid: number) => {
  try {
    return await getTTL(fid);
  } catch (error) {
    console.error(error);
  }
};
