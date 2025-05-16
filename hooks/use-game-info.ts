import { DateEndOfGameResponse } from "@/app/api/end-of-game/route";
import { useQuery } from "@tanstack/react-query";

const fetchDateEndOfGame = async () => {
  const ep = "/api/end-of-game";
  const response = await fetch(ep);
  if (!response.ok) {
    throw new Error("Error to retrieve data");
  }
  const { date } = (await response.json()) as DateEndOfGameResponse;
  return date * 1000;
};

export const useDateEndOfGame = () => {
  const { data: date, refetch } = useQuery({
    queryKey: ["end-of-game"],
    queryFn: fetchDateEndOfGame,
    staleTime: Infinity,
  });
  const getDateEndOfGame = async () => {
    const { data: dateEndOfGame } = await refetch();
    return dateEndOfGame;
  };
  const dateEndOfGame = new Date(date!).toLocaleDateString();
  return { dateEndOfGame, getDateEndOfGame };
};
