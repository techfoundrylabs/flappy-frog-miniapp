"use client";
import { menu } from "@/components/menu/menu-config";
import { MenuItem } from "@/components/menu/menu-item";
import { useMiniApp } from "@/providers/mini-app-provider";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const path = usePathname();
  const { animateOut } = useMiniApp();

  return (
    <div
      className={cn(
        "fixed bottom-8 z-50 flex w-full h-20  items-center  justify-between  px-2 mb-2  backdrop-blur-xl",
        animateOut ? "animate-slide-out-bottom" : "animate-slide-in-bottom",
      )}
    >
      <div className="flex w-full h-full bg-white/15 border-2 border-white/30 shadow-xl p-2 gap-x-4">
        {menu.map((item, index) => (
          <MenuItem
            key={index}
            url={item.url}
            icon={item.icon(path === item.url)}
            label={item.label}
            isActive={path === item.url}
          />
        ))}
      </div>
    </div>
  );
};
