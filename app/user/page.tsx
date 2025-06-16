"use client";
import { InfoCard } from "@/components/info-card";
import { BaseLayout } from "@/components/menu/base-layout";
import { IS_MAINNET } from "@/config/constants";
import { useMiniApp } from "@/providers/mini-app-provider";
import { formattedName } from "@/utils";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Coins, Copy, ExternalLink, Link, Wallet } from "lucide-react";
import Image from "next/image";

const UserPage = () => {
  const {
    address,
    chainName,
    chainExplorer,
    userName,
    userAvatar,
    formattedBalance,
  } = useMiniApp();
  const openUrl = useOpenUrl();

  const handlerOpenExplorer = () => {
    const url = `${chainExplorer}/address/${address}`;
    openUrl(url);
  };

  const handleCopyAddress = () => {
    if (!!address) navigator.clipboard.writeText(address);
  };

  return (
    <BaseLayout title="User Info" className="py-8 mb-16">
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex w-full flex-col justify-center items-center gap-y-2">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <Image
                src={userAvatar ?? ""}
                alt=""
                className="w-fit"
                width={"140"}
                height={"200"}
              />
            </div>
          </div>

          <h1 className="uppercase">{userName}</h1>
        </div>

        <InfoCard
          Icon={<Link className="w-5 h-5 text-blue-300" />}
          cardTitle="Chain"
          cardInfo={chainName}
          addInfo={
            <span className="bg-blue-500/30 text-white px-3 py-1 rounded-full text-[8px] font-medium border border-blue-400/40">
              {IS_MAINNET ? "Mainnet" : "Testnet"}
            </span>
          }
        />

        <InfoCard
          Icon={<Wallet className="w-5 h-5 text-success" />}
          cardTitle="Wallet"
          cardInfo={formattedName(address, 8)}
          addInfo={
            <div className="flex w-fit justify-between space-x-6 flex-row bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/40">
              <button onClick={handlerOpenExplorer}>
                <ExternalLink className="w-4 h-4 text-white" />
              </button>
              <button onClick={handleCopyAddress}>
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
          }
        />

        <InfoCard
          Icon={<Coins className="w-5 h-5 text-yellow-300" />}
          cardTitle="Balance"
          cardInfo={`${Number(formattedBalance).toFixed(8)} ETH`}
          className="text-[14px] text-yellow-300"
        />
      </div>
    </BaseLayout>
  );
};

export default UserPage;
