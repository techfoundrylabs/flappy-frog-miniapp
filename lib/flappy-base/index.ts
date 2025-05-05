import { UserHeartsResponse } from "@/lib/flappy-base/types";

export const playGame = async (fid: number) => {
  const res = await fetch("/api/game", {
    method: "POST",
    body: JSON.stringify({ fid }),
  });
  if (!res.ok) throw new Error("");
  const { payload: userHearts } = (await res.json()) as UserHeartsResponse;
  return userHearts.hearts;
};
