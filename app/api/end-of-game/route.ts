import { getEndOfGame } from "@/lib/redis/game-play";
import { NextResponse } from "next/server";

export interface DateEndOfGameResponse extends NextResponse {
  date: number;
}

export async function GET() {
  try {
    const date = (await getEndOfGame()) as number;
    return NextResponse.json({ date });
  } catch (error) {
    console.error("Errore nel recupero della data:", error);
    return NextResponse.json(
      { error: "Errore nel recupero della data" },
      { status: 500 },
    );
  }
}
