"use client";

import { useAuthenticate } from "@coinbase/onchainkit/minikit";

const Signin = () => {
  const { signIn } = useAuthenticate();

  const handleBtnClick = async () => {
    const result = await signIn();
    console.log(result);
    if (!result) throw new Error("");
  };

  return (
    <div>
      <button
        onClick={handleBtnClick}
        className="w-fit p-2 bg-blue-400 text-lg rounded-md"
      >
        SIGN IN
      </button>
    </div>
  );
};

export default Signin;
