import FlappyFrogPoster from "@/assets/flappy-frog-poster.png";
import FarcasterLogo from "@/assets/farcaster-white-logo.svg";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Loading } from "@/components/loading";
import { WARPCASTER_URL } from "@/config/constants";

export const Welcome = () => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <>
      <Loading className={!isImgLoaded ? "flex" : "hidden"} />
      <div
        className={`${isImgLoaded ? "flex" : "hidden"} w-full flex-col md:flex-row p-12 gap-12`}
      >
        <div className="flex items-center justify-center  z-10 bg-red  md:w-2/3">
          <Image
            src={FlappyFrogPoster}
            alt="Flappy Frog"
            className="h-[839px] w-[512px] shadow-lg shadow-violet-500 rounded-2xl"
            priority={true}
            onLoad={() => setIsImgLoaded(true)}
          />
        </div>

        <div className="flex w-full flex-col gap-y-4 items-center justify-center text-white/80">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-center text-lg md:text-5xl font-semibold">
              Welcome to
            </h1>
            <h1 className="text-lg md:text-5xl text-center font-semibold">
              Flappy Frog
            </h1>
          </div>
          <p className="text-sm md:text-[16px] font-light px-6 md:px-24  md:text-center">
            Guide our "froggy" hero through a gauntlet of pipes,
            collecting points as you soar through the obstacles. Climb your way
            to the top of the leaderboard, challenge your friends, and prove
            your skill. The ultimate champion at the top of the leaderboard will
            claim the Treasury Pool, earning glory and rewards.
          </p>
          <Link
            href={WARPCASTER_URL}
            target="_blank"
            className="my-4 bg-violet-600 w-64 text-sm rounded-md self-center  p-2 text-white "
          >
            <div className="flex flex-row items-center gap-x-2">
              <Image src={FarcasterLogo} alt="" className={"w-8 md:w-12"} />
              Start Playing
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};
