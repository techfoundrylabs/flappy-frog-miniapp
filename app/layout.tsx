import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { Press_Start_2P } from "next/font/google";
import {
  ONCHAINKIT_PROJECT_NAME,
  IMAGE_URL,
  APP_URL,
  SPLASH_BACKGROUND_COLOR,
  SPLASH_IMAGE_URL,
  VERSION,
  MINIAPP_METADATA_DESCRIPTION,
} from "@/config/constants";
import background from "@/assets/flappy-frog-bg.png";

// If loading a variable font, you don't need to specify the font weight
const press_start_2P = Press_Start_2P({
  weight: ["400"],
  subsets: ["latin"],
  style: "normal",
});
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: ONCHAINKIT_PROJECT_NAME,
    description: MINIAPP_METADATA_DESCRIPTION,
    openGraph: {
      title: ONCHAINKIT_PROJECT_NAME,
      description: MINIAPP_METADATA_DESCRIPTION,
      images: [{ url: `${IMAGE_URL}` }],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: VERSION,
        imageUrl: IMAGE_URL,
        button: {
          title: `Launch ${ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: ONCHAINKIT_PROJECT_NAME,
            url: APP_URL,
            splashImageUrl: SPLASH_IMAGE_URL,
            splashBackgroundColor: SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={press_start_2P.className}
        suppressHydrationWarning={true}
      >
        <Providers>
          <div
            className={`w-full h-screen flex flex-col justify-center items-center`}
            style={{ backgroundImage: `url(${background.src})` }}
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
