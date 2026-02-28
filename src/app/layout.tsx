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
import { ChatWidget } from "@/components/ChatWidget";
import { ClickSounds } from "@/components/ClickSounds";
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
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "32x32" },
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    "image": "https://michaelscimeca.com/hero/hero-portrait.png",
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
    "image": "https://michaelscimeca.com/hero/hero-portrait.png",
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes you different from other developers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "I build interactive experiences—not just websites. From AI-powered games to automation systems, I blend design, code, and creativity to make things that stand out."
        }
      },
      {
        "@type": "Question",
        "name": "How much does a project cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Design: $3-6k for a landing page, $6-12k for a full site, $9-18k for brand + design system. Development: $2.4-6k landing page, $6-18k full site, $12-36k+ complex app. Transparent quotes upfront."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a project take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simple site: 2-4 weeks. Complex app: 2-3 months. Realistic timelines are given upfront—no surprises."
        }
      },
      {
        "@type": "Question",
        "name": "Do you work with AI and automation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. I build chatbots, workflow automation (n8n), predictive tools, and systems that save teams hours every week."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer ongoing support after launch?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! I offer maintenance packages for updates and bug fixes. Also available for one-off tweaks as needed."
        }
      }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
          <ChatWidget />
          <ClickSounds />
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
