import type { Metadata } from "next";

import { getSession } from "~/auth"
import "~/app/globals.css";
import { Providers } from "~/app/providers";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "BTB Finance",
  description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || "Decentralized Finance Ecosystem",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://mini.btb.finance"),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
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
      <head>
        {/* Quick Auth preconnect for better performance */}
        <link rel="preconnect" href="https://quickauth.farcaster.xyz" />
        <link rel="dns-prefetch" href="https://quickauth.farcaster.xyz" />

        {/* Apple mobile web app settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Theme color for address bar */}
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="overflow-x-hidden">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
