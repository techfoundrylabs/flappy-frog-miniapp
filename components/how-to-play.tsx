export const HowToPlay = ()=>{
    return (
      <>
        <div className="flex w-full gap-y-1 flex-col">
          <h1 className="uppercase underline underline-offset-1">Controls:</h1>
          <p className="text-[10px]">TAP OR PRESS SPACE TO FLAP</p>
        </div>
        <div className="flex w-full gap-y-1 flex-col ">
          <h1 className="uppercase underline underline-offset-1">Game play:</h1>
          <div className="w-full flex flex-col gap-y-4">
            <p className="text-[10px]">
              GUIDE YOUR FROG THROUGH PIPES TO SCORE, POINTS. EVERY DAY, YOU GET
              5 HEARTS TO USE.
            </p>
            <p className="text-[10px]">
              NEED MORE? GO TO SHOP PAGE AND REFILL YOUR HEARTS.
            </p>
            <p className="text-[10px]">
              EACH DOLLAR SPENT GOES INTO THE TREASURY POOL
            </p>
            <p className="text-[10px]">
              AT THE END OF THE TREASURY POOL PERIOD, THE PLAYER WITH THE
              HIGHEST SCORE WINS THE TREASURY POOL PRICE
            </p>
            <p className="text-[10px]">{"THAT'S IT. HAVE FUN!"}</p>
          </div>
        </div>
      </>
    );
}