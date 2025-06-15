import { cn } from "@/utils";
import { ReactNode } from "react";

interface InfoCardProps {
  Icon: ReactNode;
  cardTitle: string;
  cardInfo: string;
  addInfo?: ReactNode;
  className?: string;
}

export const InfoCard = ({
  Icon,
  cardTitle,
  cardInfo,
  addInfo,
  className,
}: InfoCardProps) => {
  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            {Icon}
          </div>
          <h3 className={cn(" text-white text-[12px]")}>{cardTitle}</h3>
        </div>
        {addInfo}
      </div>
      <p className={cn("text-white/90 text-[10px]", className)}>{cardInfo}</p>
    </div>
  );
};
