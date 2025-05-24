const InfoPage = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#a37e44] text-white/90 gap-y-12 p-8">
      <h1 className="uppercase text-3xl text-center">How to play</h1>
      <div className="flex w-full gap-y-2 flex-col">
        <h1 className="uppercase text-xl ">Controls:</h1>
        <p className="text-sm">TAP OR PRESS SPACE TO FLAP</p>
      </div>
      <div className="flex w-full gap-y-2 flex-col ">
        <h1 className="uppercase text-xl ">Game play:</h1>
        <div className="w-full flex flex-col gap-y-6">
          <p className="text-sm">
            GUIDE YOUR FROG THROUGH PIPES TO SCORE, POINTS. EVERY DAY, YOU GET 5
            HEARTS TO USE.
          </p>
          <p className="text-sm">NEED MORE? PAY 1$ TO REFILL YOUR HEARTS.</p>
          <p className="text-sm">
            EACH DOLLAR SPENT IS SPLIT BETWEEN THE TREASURY POOL AND THE DEVS
            WITH A 60/40 RATIO IN FAVOR OF THE TREASURY POOL.
          </p>
          <p className="text-sm">
            AT THE END OF THE TREASURY POOL PERIOD, THE PLAYER WITH THE HIGHEST
            SCORE WINS THE TREASURY POOL PRICE
          </p>
          <p className="text-sm">THAT'S IT. HAVE FUN!</p>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
