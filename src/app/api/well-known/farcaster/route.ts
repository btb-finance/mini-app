import { NextResponse } from 'next/server';

export async function GET() {
  // Define the manifest content
  const manifest = {
    frame: {
      version: "1",
      name: "BTB Finance",
      iconUrl: "https://mini.btb.finance/logo.avif",
      homeUrl: "https://mini.btb.finance/",
      imageUrl: "https://mini.btb.finance/api/og",
      buttonTitle: "🚀 Launch",
      splashImageUrl: "https://mini.btb.finance/logo.avif",
      splashBackgroundColor: "#1e3a8a",
      category: "finance"
    }
  };

  // Return the manifest as JSON
  return NextResponse.json(manifest);
}
