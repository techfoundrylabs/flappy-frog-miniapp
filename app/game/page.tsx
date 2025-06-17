"use client";

import { Loading } from "@/components/loading";
import { useMiniApp } from "@/providers/mini-app-provider";

import dynamic from "next/dynamic";

const FlappyFrog = dynamic(
  () => import("@/components/game/flappy-frog").then((mod) => mod.FlappyFrog),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

export default function GamePage() {
  const { isFrameReady, fid, userName, userAvatar } = useMiniApp();

  if (!isFrameReady || !fid || !userName || !userAvatar) return <Loading />;

  return <FlappyFrog fid={fid} displayName={userName} avatar={userAvatar} />;
}
