import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}
export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#a37e44] text-white/90 gap-y-6 p-8">
      {children}
    </div>
  );
};
