import { Home } from "@/components/home/home";
import {
  APP_URL,
  IMAGE_URL,
  ONCHAINKIT_PROJECT_NAME,
  SPLASH_BACKGROUND_COLOR,
  SPLASH_IMAGE_URL,
  VERSION,
} from "@/config/constants";
import { Metadata } from "next";

const appUrl = APP_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ score: number }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { score } = await params;

  const imageUrl = new URL(`${appUrl}/api/og/create-cast/${score}`);

  const frame = {
    version: VERSION,
    imageUrl: `${APP_URL}/cast.png`,
    button: {
      title: `Launch ${ONCHAINKIT_PROJECT_NAME}`,
      action: {
        type: "launch_frame",
        name: ONCHAINKIT_PROJECT_NAME,
        url: appUrl,
        splashImageUrl: SPLASH_IMAGE_URL,
        splashBackgroundColor: SPLASH_BACKGROUND_COLOR,
      },
    },
  };

  return {
    title: "Mini App Starter",
    openGraph: {
      title: "Mini App Starter",
      description: "Mini App Next Template",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function StreakFlex() {
  return <Home />;
}
