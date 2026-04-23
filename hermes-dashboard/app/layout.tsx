import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hermes — Art Needlepoint Operations",
  description: "AI Operations Dashboard for The Art Needlepoint Company",
  icons: { icon: "/artneedlepoint-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
