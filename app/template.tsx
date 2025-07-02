"use client";

import { Loading } from "@/components/loading";
import { NavBar } from "@/components/navbar";
import { useMiniApp } from "@/providers/mini-app-provider";
//import sdk from "@farcaster/frame-sdk";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface TemplateLayoutProps {
  children: ReactNode;
}

//const FLAPPY_FROG_LANDING_URL = "https://flappyfrog.xyz";

const Template = ({ children }: TemplateLayoutProps) => {
  const { clientFid } = useMiniApp();
  console.log(clientFid);
  const [isMiniApp, setIsMiniApp] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMiniAppStatus = async () => {
      //const inMiniApp = await sdk.isInMiniApp()
      const inMiniApp = !!clientFid && clientFid > 0;
      if (inMiniApp) setIsMiniApp(true);
    };

    checkMiniAppStatus();
  }, [clientFid]);

  if (!isMiniApp) return <Loading />;

  return (
    <>
      {children}
      {pathname !== "/" ? <NavBar /> : null}
    </>
  );
};

export default Template;
