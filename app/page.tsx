"use client";

import { Loading } from "@/app/_components/loading";
import { Welcome } from "@/app/_components/welcome";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import { Game } from "@/app/_components/game";

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
