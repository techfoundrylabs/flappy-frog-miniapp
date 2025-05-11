"use server";

import { env } from "@/app/env";
import {
  getUserGamePlay,
  setTTL,
  setUserGamePlay,
  updateLeaderboard,
  getNthTopPlayers,
} from "@/lib/redis/game-play";

const MAX_USER_HEARTS = env.MAX_HEARTS;
const LEADERBOARD_LIMIT = 10;

export const initGame = async (fid: number) => {
  try {
    const hearts = await getUserGamePlay(fid);
    if (hearts === null) {
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

export const resetGame = async (fid: number) => {
  try {
    const res = await setUserGamePlay(fid, MAX_USER_HEARTS);
    if (res === "OK") {
      setTTL(fid);
      return MAX_USER_HEARTS;
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
  score: number,
) => {
  try {
    return updateLeaderboard(fid, displayName, score);
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
          const displayName = (currentValue as string).split(":")[1];
          (previousValue as Record<string, string>[]).push({
            name: displayName,
            score: nthTopPlayers![currentIndex + 1] as string,
          });
        }
        return previousValue;
      },
      [],
    );
  } catch (error) {
    console.error(error);
  }
};

export const refillHearts = async (fid: number) => {
  try {
    const res = await setUserGamePlay(fid, MAX_USER_HEARTS);
    if (res !== "OK") {
      throw new Error("error");
    }

    return MAX_USER_HEARTS;
  } catch (error) {
    console.error(error);
  }
};
