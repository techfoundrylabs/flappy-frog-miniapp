import { cn } from "@/utils";
import Link from "next/link";

interface MenuItemProps {
  url: string;
  icon: JSX.Element;
  label?: string;
  isActive: boolean;
  className?: string;
}

export const MenuItem = ({
  url,
  icon,
  label,
  isActive,
  className,
}: MenuItemProps) => {
  return (
    <Link href={url} className="flex w-full h-full">
      <div
        className={cn(
          "flex  w-full flex-col  h-full justify-center items-center pt-1 transition-all duration-300",
          isActive
            ? "bg-gradient-to-r from-blue-500/40 to-cyan-500/40 text-white border-2 border-blue-400/40 shadow-lg"
            : "text-white/80 hover:text-white hover:bg-white/10",
          className,
        )}
      >
        {icon}
        {label ? (
          <span
            className={cn(
              "mt-2 text-[8px]",
              isActive ? "text-white" : "text-white/80",
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </Link>
  );
};
