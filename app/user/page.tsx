"use client"
import { BaseLayout } from "@/components/menu/base-layout";

import { useAccount } from "wagmi";

const UserPage = () => {
  const { address } = useAccount();
  return (
    <BaseLayout title="User Info">
      <div className="flex w-full gap-y-1 flex-col">
        <h1 className="uppercase">Address:</h1>
        <p className="text-[10px]">{address}</p>
      </div>
      <div className="flex w-full gap-y-1 flex-col ">
        <h1 className="uppercase">Game play:</h1>
        <div className="w-full flex flex-col gap-y-4">
          <p className="text-[10px]">
            GUIDE YOUR FROG THROUGH PIPES TO SCORE, POINTS. EVERY DAY, YOU GET 5
            HEARTS TO USE.
          </p>
          <p className="text-[10px]">
            NEED MORE? PAY 1$ TO REFILL YOUR HEARTS.
          </p>
          <p className="text-[10px]">
            EACH DOLLAR SPENT IS SPLIT BETWEEN THE TREASURY POOL AND THE DEVS
            WITH A 60/40 RATIO IN FAVOR OF THE TREASURY POOL.
          </p>
          <p className="text-[10px]">
            AT THE END OF THE TREASURY POOL PERIOD, THE PLAYER WITH THE HIGHEST
            SCORE WINS THE TREASURY POOL PRICE
          </p>
          <p className="text-[10px]">{"THAT'S IT. HAVE FUN!"}</p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default UserPage;
