import { IS_MAINNET } from "@/config/constants";
import { base, baseSepolia } from "wagmi/chains";
import { useChainId, useSwitchChain } from "wagmi";
import { useState } from "react";

export const useChain = () => {
  const chain = IS_MAINNET ? base : baseSepolia;
  const targetChain = chain.id;
  const [chainUpdated, setChainUpdated] = useState(false);
  const chainName = chain.name;
  const chainExplorer = chain.blockExplorers.default.url;
  const { switchChain } = useSwitchChain();
  const currentChain = useChainId();

  const updateChain = () => {
    if (targetChain !== currentChain && !chainUpdated) {
      switchChain({ chainId: targetChain });
      setChainUpdated(true);
    }
  };

  return { chainName, chainExplorer, chainId: targetChain, updateChain };
};
