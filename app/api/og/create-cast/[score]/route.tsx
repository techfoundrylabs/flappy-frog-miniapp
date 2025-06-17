import { IMAGE_URL } from "@/config/constants";
import { loadGoogleFont, loadImage } from "@/utils/og-utils";
import { ImageResponse } from "next/og";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

/**
 * GET handler for generating dynamic OpenGraph images
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the ID
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      score: number;
    };
  },
) {
  try {
    const { score } = params;

    const logoImage = await loadImage(IMAGE_URL!);
    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      `My score is ${score}`,
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "white",
            gap: "20px",
          }}
        >
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString("base64")}`}
            style={{
              width: "100px",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />
          <div
            style={{
              color: "black",
              fontSize: 48,
              fontFamily: "PressStart2P",
              textAlign: "center",
            }}
          >
            Your Score: {score}
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "PressStart2P",
            data: fontData,
            style: "normal",
          },
        ],
      },
    );
  } catch (e) {
    console.log(`Failed to generate streak image`, e);
    return new Response(`Failed to generate streak image`, {
      status: 500,
    });
  }
}
