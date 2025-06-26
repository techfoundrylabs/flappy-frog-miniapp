export async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function loadImage(url: string | undefined): Promise<ArrayBuffer> {
  if (!url) throw new Error("Failed to find url");
  const logoImageRes = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OGImageBot/1.0)",
    },
  });

  if (!logoImageRes.ok) {
    throw new Error(`Failed to fetch logo image: ${logoImageRes.statusText}`);
  }

  return await logoImageRes.arrayBuffer();
}
