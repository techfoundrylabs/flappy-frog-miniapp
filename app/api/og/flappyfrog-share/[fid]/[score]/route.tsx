/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { APP_URL } from "@/config/constants";
import { fetchFarcasterUser } from "@/lib/neynar";
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
      fid: number;
      score: string;
    }>;
  },
) {
  try {
    // Extract the ID from the route parameters
    const { fid, score } = await params;

    // Load the logo image from the public directory
    const farcasterUser = await fetchFarcasterUser(fid);
    const avatarUrl = farcasterUser?.pfp_url;
    const userName = farcasterUser?.display_name;
    const logoImage = await loadImage(`${APP_URL}/cast.png`);

    // Load and prepare the custom font with the text to be rendered
    const fontData = await loadGoogleFont(
      "Press+Start+2P",
      "ABCDEFGHIKLMNOPQRSTUVXYZ0123456789:",
    );

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
              top: 10,
              left: 10,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              fontFamily: "PressStart2P",
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              <img
                src={avatarUrl}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid white",
                }}
              />
              <span
                style={{
                  color: "#BBE5F8",
                }}
              >
                {userName}
              </span>
            </div>
            <div style={{ display: "flex", fontSize: 20 }}>
              <span
                style={{
                  color: "#BBE5F8",
                }}
              >
                SCORE:
              </span>
              <span style={{ color: "#EE9200" }}> {score}</span>
            </div>
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
