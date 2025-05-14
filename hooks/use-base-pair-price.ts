import { GAME_PRICE_USD } from "@/config/constants";
import { getEthUsdPrice } from "@/lib/base";
import { useQuery } from "@tanstack/react-query";

export const useBasePairPrice = () => {
  const { refetch: updatePrice } = useQuery({
    queryKey: ["base-pair-price"],
    queryFn: getEthUsdPrice,
  });

  const getUsdPrice = async () => {
    const { data: price } = await updatePrice();
    return GAME_PRICE_USD / Number(price);
  };

  return { getUsdPrice };
};
