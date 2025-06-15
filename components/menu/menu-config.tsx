import Frog from "@/components/menu/frog";
import { MenuIcon } from "@/components/menu/menu-icon";
import { ChartNoAxesColumn, Info, ShoppingCart, User } from "lucide-react";

export interface Menu {
  label: string;
  url: string;
  icon: (isActive: boolean) => JSX.Element;
}

export const menu: Menu[] = [
  {
    label: "User",
    url: "/user",
    icon: (isActive: boolean) => <MenuIcon Icon={User} isActive={isActive} />,
  },
  {
    label: "Ranking",
    url: "/ranking",
    icon: (isActive: boolean) => (
      <MenuIcon Icon={ChartNoAxesColumn} isActive={isActive} />
    ),
  },
  {
    label: "Game",
    url: "/",
    icon: (isActive: boolean) => <MenuIcon Icon={Frog} isActive={isActive} />,
  },
  {
    label: "Shop",
    url: "/shop",
    icon: (isActive: boolean) => (
      <MenuIcon Icon={ShoppingCart} isActive={isActive} />
    ),
  },
  {
    label: "Info",
    url: "/info",
    icon: (isActive: boolean) => <MenuIcon Icon={Info} isActive={isActive} />,
  },
];
