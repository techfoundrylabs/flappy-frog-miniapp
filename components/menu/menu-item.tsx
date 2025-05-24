import { Menu } from "@/components/menu/menu-config";
import { cn } from "@/utils";
import Link from "next/link";

interface MenuItemProps {
  url: string;
  icon: JSX.Element;
  label?: string;
  isActive: boolean;
  className?: string;
}

interface BlockMenuProps {
  menu: Menu[];
  path: string;
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
          "flex  w-full flex-col  h-full justify-center items-center gap-y-1",
          isActive ? "bg-[#7f563b]" : "bg-[#caaa77] ",
          className,
        )}
      >
        {icon}
        {label ? (
          <span
            className={cn(
              "text-[10px]",
              !isActive ? "text-[#7f563b]" : "text-[#caaa77] ",
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </Link>
  );
};

export const BlockMenu = ({ menu, path }: BlockMenuProps) => {
  return (
    <div className="flex w-full justify-center items-center">
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
  );
};
