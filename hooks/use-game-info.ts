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
  const {
    data: dateEndOfGameUnix,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["end-of-game"],
    queryFn: fetchDateEndOfGame,
    staleTime: Infinity,
  });

  // Calculate the date plus one day
  let nextDayTimestamp: number | undefined;
  if (dateEndOfGameUnix) {
    nextDayTimestamp = dateEndOfGameUnix + 24 * 60 * 60 * 1000; // Add one day in milliseconds
  }

  const dateEndOfGame = dateEndOfGameUnix
    ? new Date(dateEndOfGameUnix).toLocaleDateString()
    : undefined;
  const dateEndOfGamePlusOneDay = nextDayTimestamp
    ? new Date(nextDayTimestamp).toLocaleDateString()
    : undefined;

  return {
    dateEndOfGameUnix,
    dateEndOfGame,
    dateEndOfGamePlusOneDay,
    isLoading,
    isSuccess,
  };
};
