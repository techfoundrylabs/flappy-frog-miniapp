"use client";

import { Loading } from "@/components/loading";
import { Welcome } from "@/components/welcome";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const Game = dynamic(
  () => import("@/components/game").then((mod) => mod.Game),
  {
    ssr: false,
  },
);

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
