"use client";

import { Loading } from "@/app/_components/loading";
import { Welcome } from "@/app/_components/welcome";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("@/app/_components/game").then((mod) => mod.Game), {
  ssr: false,
});

export default function App() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  if (!isFrameReady) return <Loading />;

  return !!context ? <Game /> : <Welcome />;
}
