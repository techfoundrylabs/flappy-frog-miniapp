"use client";
import { HowToPlay } from "@/components/how-to-play";
import { BaseLayout } from "@/components/menu/base-layout";

const InfoPage = () => {
  return (
    <BaseLayout title="How to play" className="py-8">
      <HowToPlay />
    </BaseLayout>
  );
};

export default InfoPage;
