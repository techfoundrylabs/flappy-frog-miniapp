"use client";
import { Loading } from "@/components/loading";
import { NavBar } from "@/components/navbar";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ReactNode, useEffect } from "react";

interface TemplateLayoutProps {
  children: ReactNode;
}

const Template = ({ children }: TemplateLayoutProps) => {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
    
  }, [context, isFrameReady, setFrameReady]);

  if (!isFrameReady) return <Loading />;

  return (
    <div className="w-full flex flex-col justify-center items-center gap-y-4 text-xs">
      {children}

      {context ? <NavBar /> : null}
    </div>
  );
};

export default Template;
