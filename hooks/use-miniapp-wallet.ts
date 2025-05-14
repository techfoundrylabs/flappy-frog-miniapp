import { refillHearts } from "@/actions";
import { IS_MAINNET } from "@/config/constants";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useCallback, useEffect } from "react";
import { base, baseSepolia } from "viem/chains";
import { formatEther } from "viem/utils";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useSwitchChain,
} from "wagmi";

const CHAIN = IS_MAINNET ? base : baseSepolia;

export const useMiniappWallet = () => {
  const { context } = useMiniKit();

  const chainName = CHAIN.name;

  const addFrame = useAddFrame();

  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { refetch: refetchBalance } = useBalance({
    address,
    chainId: CHAIN.id,
  });

  const farcasterConnector = connectors[0];

  const getWalletBalance = async () => {
    const { data: balance } = await refetchBalance();
    const formattedBalance = formatEther(balance?.value ?? BigInt(0));
    return formattedBalance;
  };

  const handleWallectConnect = useCallback(async () => {
    try {
      await connectAsync({
        connector: farcasterConnector,
      });
    } catch (error) {
      console.error(error);
    }
  }, [connectAsync, farcasterConnector]);

  const checkFrameAndAdd = useCallback(async () => {
    try {
      await addFrame();
    } catch (error) {
      console.warn("addFrame was rejected by the user", error);
    }
  }, [addFrame]);

  const refillHeart = useCallback(async () => {
    if (!!context) {
      await refillHearts(context.user.fid);
    }
  }, [context]);

  useEffect(() => {
    if (chainId !== CHAIN.id) {
      switchChainAsync({ chainId: CHAIN.id });
    }
    if (!isConnected && !isConnecting) {
      handleWallectConnect();
    }
    if (!context?.client.added) {
      checkFrameAndAdd();
    }
  }, [
    chainId,
    checkFrameAndAdd,
    context?.client.added,
    handleWallectConnect,
    isConnected,
    isConnecting,
    refillHeart,
    switchChainAsync,
  ]);

  return {
    chainName,
    address,
    isConnected,
    context,
    getWalletBalance,
  };
};
