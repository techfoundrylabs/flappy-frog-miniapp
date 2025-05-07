import { redis } from "@/lib/redis/redis";

const notificationServiceKey =
  process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";

const ONE_DAY = 60 * 60 * 24;

const getUserGamePlayKey = (fid: number): string => {
  return `${notificationServiceKey}:hearts:${fid}`;
};

export const setTTL = async (fid: number) => {
  if (!redis) {
    return null;
  }
  try {
    const ttl = Math.floor(Date.now() / 1000) + ONE_DAY;
    await redis.expireat(getUserGamePlayKey(fid), ttl);
    return true;
  } catch (error) {
    console.error(error);
  }
};

export const setUserGamePlay = async (fid: number, hearts: number) => {
  if (!redis) {
    return null;
  }
  try {
    return await redis.set<number>(getUserGamePlayKey(fid), hearts, {
      keepTtl: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getUserGamePlay = async (fid: number) => {
  if (!redis) {
    return null;
  }
  try {
    return await redis.get<number>(getUserGamePlayKey(fid));
  } catch (error) {
    console.error(error);
  }
};
