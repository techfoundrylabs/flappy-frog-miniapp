"use client";
import { menu } from "@/components/menu/menu-config";
import { BlockMenu } from "@/components/menu/menu-item";
import { useMiniApp } from "@/providers/mini-app-provider";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const path = usePathname();
  const { animateOut } = useMiniApp();

  return (
    <div
      className={cn(
        "absolute bottom-0 z-10 flex w-full h-16  items-center  justify-between  px-2 mb-2  ",
        animateOut ? "animate-slide-out-bottom" : "animate-slide-in-bottom",
      )}
    >
      <div className="flex w-full h-full bg-[var(--bg-navbar)] border-2 border-[var(--bg-navbar-100)] rounded-md">
        <BlockMenu menu={menu} path={path} />
      </div>
    </div>
  );
};
