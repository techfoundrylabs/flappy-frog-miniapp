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
        <div className="flex justify-center  items-center gap-x-2">
          {Icon}
          <div className="flex flex-col gap-y-1">
            <h3 className={cn(" text-white text-[12px]")}>{cardTitle}</h3>
            <p className={cn("text-white/50 text-[9px]", className)}>
              {cardInfo}
            </p>
          </div>
        </div>

        {addInfo}
      </div>
    </div>
  );
};
