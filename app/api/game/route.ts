import { env } from "@/app/env";
import { getUserGamePlay, initUserGamePlayDaily } from "@/lib/redis/game-play";
import { NextResponse } from "next/server";

const MAX_USER_HEARTS = env.MAX_HEARTS ?? 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid } = body;

    let hearts = await getUserGamePlay(fid);
    if (!hearts) {
      hearts = await initUserGamePlayDaily(fid, Number(MAX_USER_HEARTS));
    }

    return NextResponse.json({ payload: { hearts: hearts } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
