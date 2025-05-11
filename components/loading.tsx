import { cn } from "@/utils";

interface LoadingProps {
  className?: string | undefined;
}
export const Loading = ({ className }: LoadingProps) => {
  return (
    <h1 className={cn("text-3xl text-white/90", className)}>Loading...</h1>
  );
};
