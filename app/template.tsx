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

const FLAPPY_FROG_LANDING_URL = "https://flappyfrog.xyz";

const Template = ({ children }: TemplateLayoutProps) => {
  const { fid } = useMiniApp();
  const [isMiniApp, setIsMiniApp] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMiniAppStatus = async () => {
      try {
        //const inMiniApp = await sdk.isInMiniApp()
        const inMiniApp = !!fid && fid > 0;
        if (!inMiniApp) {
          console.log("Redirecting...");
          window.location.href = FLAPPY_FROG_LANDING_URL;
        } else {
          setIsMiniApp(true);
        }
      } catch (error) {
        console.error("Error checking mini app status:", error);
        // Fallback: decide whether to redirect or show error
        window.location.href = FLAPPY_FROG_LANDING_URL;
      }
    };

    checkMiniAppStatus();
  }, [fid]);

  if (!isMiniApp) return <Loading />;

  return (
    <>
      {children}
      {pathname !== "/" ? <NavBar /> : null}
    </>
  );
};

export default Template;
