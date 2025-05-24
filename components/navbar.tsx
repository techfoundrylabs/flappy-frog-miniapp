"use client";
import { menu } from "@/components/menu/menu-config";
import { BlockMenu, MenuItem } from "@/components/menu/menu-item";
import { usePathname } from "next/navigation";

const GAME_MENU_INDEX = 2;

export const NavBar = () => {
  const path = usePathname();
  const leftMenu = menu.filter((_, index) => index < 2);
  const rightMenu = menu.filter((_, index) => index > 2);
  return (
    <div className="flex w-full px-2  mb-4 absolute bottom-0 ">
      <div className=" z-10 flex w-full h-16  items-center bg-[#caaa77] justify-between border-4 border-[var(--bg-navbar-100)]">
        <div className="flex w-1/2 h-full">
          <BlockMenu menu={leftMenu} path={path} />
        </div>
        <div className="rounded-full border-4 p-4 bg-[var(--bg-navbar)] border-[var(--bg-navbar-100)]">
          <MenuItem
            url={menu[GAME_MENU_INDEX].url}
            icon={menu[GAME_MENU_INDEX].icon(path === menu[2].url)}
            isActive={path === menu[GAME_MENU_INDEX].url}
            className="w-full p-0"
          />
        </div>
        <div className="flex w-1/2 h-full">
          <BlockMenu menu={rightMenu} path={path} />
        </div>
      </div>
    </div>
  );
};
