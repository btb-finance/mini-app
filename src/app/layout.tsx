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
