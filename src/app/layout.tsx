import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from "~/app/providers";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "BTB Finance",
  description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || "Decentralized Finance Ecosystem",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://mini.btb.finance"),
  openGraph: {
    title: "BTB Finance",
    description: "Decentralized Finance Ecosystem",
    images: ["/api/og"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BTB Finance",
    description: "Decentralized Finance Ecosystem",
    images: ["/api/og"],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/images/newhomeimg.png` : "https://mini.btb.finance/images/newhomeimg.png",
      button: {
        title: "Launch BTB Finance",
        action: {
          type: "launch_frame",
          name: "BTB Finance",
          url: process.env.NEXT_PUBLIC_URL || "https://mini.btb.finance",
          splashImageUrl: process.env.NEXT_PUBLIC_URL ? `${process.env.NEXT_PUBLIC_URL}/images/newhomeimg.png` : "https://mini.btb.finance/images/newhomeimg.png",
          splashBackgroundColor: "#1e3a8a",
        },
      },
    }),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  const session = await getSession()

  return (
    <html lang="en">
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
