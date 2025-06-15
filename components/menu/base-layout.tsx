import { cn } from "@/utils";
import { ReactNode } from "react";

interface BaseLayoutProps {
  title: string;
  children: ReactNode;
  className?: string | undefined;
}
export const BaseLayout = ({ title, children, className }: BaseLayoutProps) => {
  return (
    <div
      className={cn(
        "bg-white/20 backdrop-blur-xl flex flex-1 min-h-sceen  flex-col  w-full p-4 gap-y-2 overflow-y-auto",
        className,
      )}
    >
      <h1 className="uppercase text-lg text-center text-white/90">{title}</h1>
      <div
        className={cn(
          " flex w-full flex-col bg-gradient-to-br from-blue-700/20 to-purple-700/20 text-white/90 gap-y-4 rounded-2xl p-4",
        )}
      >
        {children}
      </div>
    </div>
  );
};
