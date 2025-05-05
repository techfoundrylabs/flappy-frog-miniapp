"use client";

import { Loading } from "@/app/components/loading";
import { Welcome } from "@/app/components/welcome";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import { FlappyBirdComponent } from "@/app/components/FlappyBirdComponent";

export default function App() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const addFrame = useAddFrame();

  useEffect(() => {
    const checkFrameAndAdd = async () => {
      try {
        await addFrame();
      } catch (error) {
        console.warn("addFrame was rejected by the user", error);
      }
    };

    if (!isFrameReady) {
      setFrameReady();
    }
    if (!context?.client.added) {
      checkFrameAndAdd();
    }
  }, [setFrameReady, isFrameReady, context?.client.added, addFrame]);

  if (!isFrameReady) return <Loading />;

  return !!context ? <FlappyBirdComponent /> : <Welcome />;
}
