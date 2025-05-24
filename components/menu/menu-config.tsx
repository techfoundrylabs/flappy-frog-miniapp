import Frog from "@/components/menu/frog";
import { MenuIcon } from "@/components/menu/menu-icon";
import { BookOpen, ChartNoAxesColumn, Info, User } from "lucide-react";

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
    url: "/game",
    icon: (isActive: boolean) => <MenuIcon Icon={Frog} isActive={isActive} />,
  },
  {
    label: "History",
    url: "/history",
    icon: (isActive: boolean) => (
      <MenuIcon Icon={BookOpen} isActive={isActive} />
    ),
  },
  {
    label: "Info",
    url: "/info",
    icon: (isActive: boolean) => <MenuIcon Icon={Info} isActive={isActive} />,
  },
];
