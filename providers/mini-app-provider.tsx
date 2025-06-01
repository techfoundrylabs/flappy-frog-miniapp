import { useChain } from "@/hooks/use-chain";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useConnect } from "wagmi";

interface MiniAppContextParam {
  animateOut: boolean;
  isFrameReady: boolean;
  fid: number | undefined;
  userName: string | undefined;
  address: `0x${string}` | undefined;
  setAnimateOut: Dispatch<SetStateAction<boolean>>;
  getWalletBalance: () => Promise<string>;
}

const MiniAppContext = createContext<MiniAppContextParam | undefined>(
  undefined,
);

interface MiniAppProviderProps {
  children: ReactNode;
}

export const MiniAppProvider = ({ children }: MiniAppProviderProps) => {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [animateOut, setAnimateOut] = useState(false);
  const addFrame = useAddFrame();
  const { chainId, updateChain } = useChain();

  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { refetch: refetchBalance } = useBalance({
    address,
    chainId,
  });

  const farcasterConnector = connectors[0];
  updateChain();

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

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }

    if (!isConnected && !isConnecting) {
      handleWallectConnect();
    }

    if (!!context && !context.client.added) {
      checkFrameAndAdd();
    }
  }, [
    checkFrameAndAdd,
    context,
    handleWallectConnect,
    isConnected,
    isConnecting,
    isFrameReady,
    setFrameReady,
  ]);

  const fid = context?.user.fid;
  const userName = context?.user.username;

  const value = {
    animateOut,
    isFrameReady,
    fid,
    userName,
    address,
    setAnimateOut,
    getWalletBalance,
  };

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  );
};

export const useMiniApp = () => {
  const context = useContext(MiniAppContext);
  if (!context) throw new Error("Failed to retrieve context");
  return context;
};
