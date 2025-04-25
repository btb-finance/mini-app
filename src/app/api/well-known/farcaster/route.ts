import { NextResponse } from 'next/server';

export async function GET() {
  // Define the manifest content
  const manifest = {
    frame: {
      version: "1",
      name: "BTB Finance",
      iconUrl: "https://mini.btb.finance/images/btb-logo.png",
      homeUrl: "https://mini.btb.finance/",
      imageUrl: "https://mini.btb.finance/frame.html",
      buttonTitle: "🚀 Launch",
      splashImageUrl: "https://mini.btb.finance/images/btb-logo.png",
      splashBackgroundColor: "#1e3a8a",
      category: "finance"
    }
  };

  // Return the manifest as JSON
  return NextResponse.json(manifest);
}
