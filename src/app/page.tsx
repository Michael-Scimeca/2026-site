import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Timeline } from "@/components/Timeline";
import { Footer } from "@/components/Footer";

// Mock Data
const MOCK_DATA = {
  title: "Michael Scimeca",
  headline: "Creative Developer & Designer",
  subHeadline: "Building polished digital experiences with a focus on motion and interaction.",
  heroImage: {
    src: "/hero-portrait.jpg",
    alt: "Michael Scimeca Portrait"
  },
  about: [
    {
      _type: "block",
      children: [
        {
          _type: "span",
          text: "I am a multidisciplinary developer based in San Francisco, specializing in Next.js, React, and creative coding. With a background in design, I bridge the gap between aesthetics and engineering to build products that feel as good as they look."
        }
      ]
    },
    {
      _type: "block",
      children: [
        {
          _type: "span",
          text: "Currently open for new opportunities and collaborations."
        }
      ]
    }
  ],
  experience: [
    {
      _key: "1",
      company: "Meta Reality Labs",
      role: "Lead Product Designer",
      dateRange: "22' — 24'",
      creditLabel: "Meta Credits",
      creditLinks: "Meta, Mixed Reality News, Road to VR",
      thumbnail: "/clips/patreon.mp4",
      description: []
    },
    {
      _key: "2",
      company: "Spotify",
      role: "Senior Product Designer",
      dateRange: "21' — 21'",
      creditLabel: "Record a Podcast",
      creditLinks: "Tech Crunch",
      thumbnail: "/clips/twix.mp4",
      description: []
    },
    {
      _key: "3",
      company: "Apple",
      role: "Senior Product Designer",
      dateRange: "20' — 21'",
      creditLabel: "International HI Media Services",
      creditLinks: "Apple Music, Apple Maps",
      thumbnail: "/clips/kovitz.mp4",
      description: []
    }
  ],
  timeline: [
    {
      id: "1",
      company: "LogicGate",
      date: "2022 - Present",
      roles: [
        {
          title: "Frontend Developer III",
          description: [
            "I lead feature development on a team by analyzing requirements, designing solutions, and assist in evolving the frontend chapter of our organization."
          ]
        },
        {
          title: "Frontend Developer II",
          description: [
            "I joined LogicGate and immediately took charge of feature development on my team while also assisting other frontend developers in the organization."
          ]
        }
      ]
    },
    {
      id: "2",
      company: "Cognizant",
      date: "2019 - 2021",
      roles: [
        {
          title: "Senior Fullstack Developer",
          description: [
            "I designed and developed full-stack RESTful microservices using Netflix OSS, Java, Spring Boot, SQL, Angular, React, and Vue.",
            "I led development teams, utilizing extreme programming principles such as agile, test-driven development, and paired programming.",
            "I spearheaded the information architecture and developed a reusable UI component library for healthcare clients.",
            "I led over 650 developers through a monthly enablement process, training them for client work on the Digital Engineering stack."
          ]
        }
      ]
    },
    {
      id: "3",
      company: "projekt202",
      date: "2018 - 2019",
      roles: [
        {
          title: "UI Developer",
          description: [
            "I assisted in developing a reusable UI component library and worked closely with a multi-million dollar airline client to gather requirements.",
            "My responsibility included developing solutions for enterprise clients worth millions of dollars, using Angular 7 for the frontend."
          ]
        }
      ]
    },
    {
      id: "4",
      company: "Major 4 Apps",
      date: "2018 - 2019",
      roles: [
        {
          title: "Founder & Developer",
          description: [
            "I developed custom applications for clients, designed, developed, tested, and supported mobile applications on iOS and Android platforms.",
            "My mobile game ranked among the top 200 on the Amazon App Store."
          ]
        }
      ]
    }
  ],
  footer: {
    email: "mikeyscimeca@gmail.com",
    location: "San Francisco, CA",
    socialHandle: "@mikeyscimeca"
  }
};


export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-white selection:bg-blue-500/30">
      <Hero
        title={MOCK_DATA.title}
        // @ts-expect-error - Mock image format differs slightly from Sanity source
        heroImage={MOCK_DATA.heroImage}
        headline={MOCK_DATA.headline}
        subHeadline={MOCK_DATA.subHeadline}
      />
      <About description={MOCK_DATA.about} />
      <Experience items={MOCK_DATA.experience} />
      <Timeline items={MOCK_DATA.timeline} />
      <Footer
        email={MOCK_DATA.footer?.email}
        location={MOCK_DATA.footer?.location}
        socialHandle={MOCK_DATA.footer?.socialHandle}
      />
    </main>
  );
}
