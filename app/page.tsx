"use client";

import { Loading } from "@/components/loading";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const Game = dynamic(
  () => import("@/components/game").then((mod) => mod.Game),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

export default function App() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  if (!isFrameReady || !context) return <Loading />;

  const fid = context.user.fid;
  const userName = context.user.username ?? "";

  return <Game fid={fid} displayName={userName} />;
}
