/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { APP_URL } from "@/config/constants";
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
    params: Promise<{
      score: string;
    }>;
  },
) {
  try {
    // Extract the ID from the route parameters
    const { score } = await params;

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${APP_URL}/cast.png`);

    // Load and prepare the custom font with the text to be rendered
    const fontData = await loadGoogleFont("Press+Start+2P", "SCORE" + score);

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Render the logo image */}
          <img
            src={`data:image/png;base64,${Buffer.from(logoImage).toString(
              "base64",
            )}`}
            style={{
              width: 600,
              height: 400,
            }}
          />
          {/* Display the example ID with custom styling */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 50,
              color: "#BBE5F8",
              fontSize: 28,
              fontFamily: "PressStart2P",
              textAlign: "center",
              display: "flex",
            }}
          >
            SCORE
          </div>
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 50,
              color: "#EE9200",
              fontSize: 40,
              fontFamily: "PressStart2P",
              textAlign: "center",
              display: "flex",
            }}
          >
            {score}
          </div>
        </div>
      ),
      {
        ...size,
        // Configure the custom font for use in the image
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
    // Log and handle any errors during image generation
    console.log(`Failed to generate streak image`, e);
    return new Response(`Failed to generate streak image`, {
      status: 500,
    });
  }
}
