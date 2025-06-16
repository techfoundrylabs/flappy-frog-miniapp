"use client";
import { HowToPlay } from "@/components/how-to-play";
import { BaseLayout } from "@/components/menu/base-layout";
import { useRouter } from "next/navigation";

const InfoPage = () => {
  const router = useRouter();

  const handlePlayBtn = async () => {
    await router.push("/game");
  };

  return (
    <BaseLayout title="How to play" className="py-8">
      <HowToPlay />
      <button
        className="my-2 btn btn-success text-white text-[12px]"
        onClick={handlePlayBtn}
      >
        Ready to play...
      </button>
    </BaseLayout>
  );
};

export default InfoPage;
