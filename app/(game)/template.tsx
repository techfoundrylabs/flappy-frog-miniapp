import { NavBar } from "@/components/navbar";
import { ReactNode } from "react";

interface GameLayout {
  children: ReactNode;
}

const GameTemplate = ({ children }: GameLayout) => {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-y-4 text-xs">
      {children}

      <NavBar />
    </div>
  );
};

export default GameTemplate;
