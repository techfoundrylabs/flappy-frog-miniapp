"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Game = () => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push("/game-over");
    }, 5000);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center gap-y-4">
      <h1>PLAYING</h1>
    </div>
  );
};

export default Game;
