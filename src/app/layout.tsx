import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import { CurveLoader } from "@/components/CurveLoader";
import DynamicFavicon from "@/components/DynamicFavicon";
import { ModalProvider } from "@/context/ModalContext";
import { ScheduleModal } from "@/components/ScheduleModal";
import { CookieConsent } from "@/components/CookieConsent";
import { OutboundLinkTracker } from "@/components/OutboundLinkTracker";
import Script from "next/script";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Michael Scimeca — Senior Web Developer & AI Automation Specialist",
  description: "Experienced senior web developer and AI automation specialist building intelligent digital products and workflows for brands and teams.",
  keywords: [
    "web developer",
    "full-stack developer",
    "AI automation",
    "Next.js developer",
    "WordPress developer",
    "JavaScript developer",
    "React developer",
    "Michael Scimeca",
    "Mikey Scimeca",
    "web design",
    "digital products",
    "UI/UX design"
  ],
  authors: [{ name: "Michael Scimeca" }],
  creator: "Michael Scimeca",
  publisher: "Michael Scimeca",
  metadataBase: new URL('https://michaelscimeca.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://michaelscimeca.com",
    title: "Michael Scimeca — Senior Web Developer & AI Automation Specialist",
    description: "Experienced senior web developer and AI automation specialist building intelligent digital products and workflows for brands and teams.",
    siteName: "Michael Scimeca Portfolio",
    images: [
      {
        url: "og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Michael Scimeca - Web Developer & AI Automation Specialist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Scimeca — Senior Web Developer & AI Automation Specialist",
    description: "Experienced senior web developer and AI automation specialist building intelligent digital products and workflows for brands and teams.",
    images: ["og/og-image.png"],
    creator: "@mikeyscimeca",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "G-K1EFNGT352",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Michael Scimeca",
    "alternateName": "Mikey Scimeca",
    "url": "https://michaelscimeca.com",
    "image": "https://michaelscimeca.com/hero-portrait.png",
    "jobTitle": "Full-Stack Web Developer & AI Automation Specialist",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "sameAs": [
      "https://github.com/Michael-Scimeca",
      "https://www.linkedin.com/in/michael-scimeca"
    ],
    "knowsAbout": [
      "Web Development",
      "AI Automation",
      "Next.js",
      "React",
      "JavaScript",
      "WordPress",
      "n8n",
      "UI/UX Design"
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Michael Scimeca - Web Development & AI Automation",
    "image": "https://michaelscimeca.com/hero-portrait.png",
    "url": "https://michaelscimeca.com",
    "telephone": "",
    "email": "mikeyscimeca.dev@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "priceRange": "$$",
    "description": "Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products.",
    "serviceType": [
      "Web Development",
      "AI Automation",
      "Web Design",
      "Custom Web Applications",
      "WordPress Development",
      "API Integration"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased bg-[#656766] text-zinc-900`}
        suppressHydrationWarning
      >



        <ModalProvider>
          <CurveLoader />
          <SmoothScroll />
          <CustomCursor />
          <DynamicFavicon />
          <ScheduleModal />
          <CookieConsent />
          <OutboundLinkTracker />
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
