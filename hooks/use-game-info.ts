import { DateEndOfGameResponse } from "@/app/api/end-of-game/route";
import { useQuery } from "@tanstack/react-query";

const fetchDateEndOfGame = async () => {
  const ep = "/api/end-of-game";
  const response = await fetch(ep);
  if (!response.ok) {
    throw new Error("Error to retrieve data");
  }
  const { date } = (await response.json()) as DateEndOfGameResponse;
  return new Date(date * 1000).toLocaleDateString();
};

export const useDateEndOfGame = () => {
  const {
    data: dateEndOfGame,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["end-of-game"],
    queryFn: fetchDateEndOfGame,
    staleTime: Infinity,
  });
  return { dateEndOfGame, error, isLoading };
};
