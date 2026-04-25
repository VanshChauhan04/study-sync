import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySync | AI Study Group Finder",
  description:
    "Find compatible study groups, collaborate live, and build better study habits with AI-powered recommendations.",
  applicationName: "StudySync"
};

export const viewport: Viewport = {
  themeColor: "#8C271E",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
