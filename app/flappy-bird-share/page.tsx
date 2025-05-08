import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_URL;
  const imageUrl = new URL(`${process.env.NEXT_PUBLIC_URL}/logo.png`);

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Launch App",
      action: {
        type: "launch_frame",
        name: "Launch App",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: "Lorem Ipsum",
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
  return <App />;
}
