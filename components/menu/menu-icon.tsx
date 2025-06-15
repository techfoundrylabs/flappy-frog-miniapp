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
  return (
    <Icon size={size} className={isActive ? "text-white" : "text-white/80"} />
  );
};
