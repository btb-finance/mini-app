import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the URL of the request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  // Default metadata
  const metadata = {
    title: "BTB Finance",
    description: "Decentralized Finance Ecosystem",
    image: `${baseUrl}/btb-share-image.png`,
    url: baseUrl,
    icons: [
      {
        src: `${baseUrl}/btb-logo.png`,
        sizes: "192x192",
        type: "image/png"
      }
    ],
    theme_color: "#3b82f6",
    background_color: "#f8fafc"
  };

  return NextResponse.json(metadata);
}
