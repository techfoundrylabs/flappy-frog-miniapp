"use server";

import { env } from "@/app/env";
import {
  getUserGamePlay,
  setTTL,
  setUserGamePlay,
  updateLeaderboard,
  getNthTopPlayers,
  setRefillGamePlay,
} from "@/lib/redis/game-play";

interface Player {
  name: string;
  avatar: string;
  score: number;
}

export type TopPlayer = Player[];

const MAX_USER_HEARTS = env.MAX_HEARTS;
const LEADERBOARD_LIMIT = 10;

export const initGame = async (
  fid: number,
  attempts: number = MAX_USER_HEARTS,
) => {
  try {
    const hearts = await getUserGamePlay(fid);
    if (hearts === null) {
      const res = await setUserGamePlay(fid, attempts);
      if (res === "OK") {
        setTTL(fid);
        return attempts;
      }
    }
    return hearts;
  } catch (error) {
    console.error(error);
  }
};

export const refillHearts = async (fid: number, attempts: number) => {
  try {
    const res = await setRefillGamePlay(fid, attempts);
    if (res === "OK") {
      return attempts;
    }
  } catch (error) {
    console.error(error);
  }
};

export const decreaseHearts = async (fid: number, hearts: number) => {
  try {
    setUserGamePlay(fid, hearts);
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
          const displayName = (currentValue as string).split("@@")[1];
          const avatar = (currentValue as string).split("@@")[2];
          (previousValue as Record<string, string>[]).push({
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
