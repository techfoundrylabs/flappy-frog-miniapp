import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface MenuIconProps {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  size?: number;
  isActive: boolean;
}

export const MenuIcon = ({ Icon, size = 26, isActive }: MenuIconProps) => {
  const color = isActive ? "var(--bg-navbar)" : "var(--bg-navbar-100)";
  return <Icon size={size} color={color} />;
};
