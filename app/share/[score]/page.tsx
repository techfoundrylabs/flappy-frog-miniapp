import { Home } from "@/components/home/home";
import {
  APP_URL,
  MINIAPP_METADATA_DESCRIPTION,
  ONCHAINKIT_PROJECT_NAME,
  SPLASH_BACKGROUND_COLOR,
  SPLASH_IMAGE_URL,
  VERSION,
} from "@/config/constants";
import { Metadata } from "next";

const appUrl = APP_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ score: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { score } = await params;

  const imageUrl = new URL(`${appUrl}/api/og/flappyfrog-share/${score}`);

  const frame = {
    version: VERSION,
    imageUrl: imageUrl.toString(),
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
    title: `Launch ${ONCHAINKIT_PROJECT_NAME}`,
    description: MINIAPP_METADATA_DESCRIPTION,

    openGraph: {
      title: ONCHAINKIT_PROJECT_NAME,
      description: MINIAPP_METADATA_DESCRIPTION,
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function FlappyFrogShare() {
  return <Home />;
}
