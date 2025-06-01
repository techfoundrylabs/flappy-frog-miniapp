import { ReactNode } from "react";

interface BaseLayoutProps {
  title: string;
  children: ReactNode;
}
export const BaseLayout = ({ title, children }: BaseLayoutProps) => {
  return (
    <div className="flex h-sceen  flex-col  w-full bg-[#a37e44] text-white/90 gap-y-2 px-8 py-4">
      <h1 className="uppercase text-lg text-center">{title}</h1>
      {children}
    </div>
  );
};
