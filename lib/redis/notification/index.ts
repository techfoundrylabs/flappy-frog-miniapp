import { ONCHAINKIT_PROJECT_NAME } from "@/config/constants";
import { redis } from "@/lib/redis/redis";
import type { FrameNotificationDetails } from "@farcaster/frame-sdk";

const notificationServiceKey = ONCHAINKIT_PROJECT_NAME;

function getUserNotificationDetailsKey(fid: number): string {
  return `${notificationServiceKey}:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number,
): Promise<FrameNotificationDetails | null> {
  if (!redis) {
    return null;
  }

  return await redis.get<FrameNotificationDetails>(
    getUserNotificationDetailsKey(fid),
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails,
): Promise<void> {
  if (!redis) {
    return;
  }

  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number,
): Promise<void> {
  if (!redis) {
    return;
  }

  await redis.del(getUserNotificationDetailsKey(fid));
}
