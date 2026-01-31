import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import { CurveLoader } from "@/components/CurveLoader";
import DynamicFavicon from "@/components/DynamicFavicon";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Michael Scimeca | Web Developer, Designer & AI Engineer",
  description: "Michael Scimeca is a versatile technologist specializing in building high-end digital experiences, AI-powered platforms, and innovative web solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-[#656766] text-zinc-900`}
        suppressHydrationWarning
      >
        <CurveLoader />
        <SmoothScroll />
        <CustomCursor />
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
