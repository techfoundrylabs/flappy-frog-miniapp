"use client";

import Link from "next/link";

export default function GameOver() {
  return (
    <div className="flex flex-col justify-center items-center gap-y-4">
      <h1>GAME OVER</h1>
      <Link href={"/game"}>
        <button className="w-fit p-2 bg-blue-400 text-lg rounded-md">
          RETRY
        </button>
      </Link>
    </div>
  );
}
