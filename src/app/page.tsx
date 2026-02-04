import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Setup } from "@/components/Setup";
import { Footer } from "@/components/Footer";
import { FloatingMenu } from "@/components/FloatingMenu";

import { client } from "@/sanity/lib/client";

export default async function Home() {
  const data = await client.fetch(`
    *[_type == "homePage"][0]{
      title,
      headline,
      subHeadline,
      "heroImage": {
        "src": heroImage.asset->url,
        "alt": heroImage.alt
      },
      about,
      experience[]{
        _key,
        company,
        role,
        tools,
        dateRange,
        creditLabel,
        creditLinks,
        "thumbnail": thumbnail.asset->url,
        description
      },
      timeline,
      footer
    }
  `, {}, {
    next: { revalidate: 60 } // Revalidate every 60s
  });

  if (!data) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  // Inject mock tools if missing (Temporary for development/demo)
  const mockToolSets = [
    ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Sanity CMS", "Vercel", "Figma"],
    ["Vue.js", "Nuxt", "JavaScript", "SCSS", "GSAP", "Storyblok", "Netlify", "Adobe XD"],
    ["React Native", "Expo", "Redux", "Styled Components", "Firebase", "Jest", "Git", "Jira"],
    ["Node.js", "Express", "MongoDB", "Mongoose", "AWS", "Docker", "Redis", "CircleCI"]
  ];

  const PROJECT_COLORS = [
    '#0158ff', // Blue
    '#a855f7', // Purple
    '#ef4444', // Red
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#3b82f6', // Bright Blue
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  const experienceWithTools = [
    {
      _key: 'patreon',
      company: 'Patreon',
      role: 'Creative Developer',
      description: "For Halloween 2021, I led the animation strategy and implementation for Trick-or-True Crime, an interactive microsite created with Patreon. Using immersive Lottie animations and horizontal scrolling, the experience blended cinematic storytelling with playful interactivity to deliver a dark, memorable Halloween experience.",
      tools: ["SPA", "Browserstack", "Lottie", "Sanity CMS", "GSAP"],
      thumbnail: '/clips/patreon.mp4',
      themeColor: '#e45253',
      logo: '/logos/patreon-logo.svg'
    },
    {
      _key: 'twix',
      company: 'Twix NFT',
      description: "Working at RSQ, I contributed to the strategy and implementation of #NFTwix, TWIX’s first-ever NFT drop, developed with Mars, Inc. Partnering with artist YEAHYEAHCHLOE and hosted on MakersPlace, the campaign featured a split-screen interactive site where fans chose sides and competed for exclusive prizes.",
      role: 'Creative Developer',
      tools: ["Wordpress", "Browserstack", "GSAP", 'Lenis', 'Barba.js'],
      thumbnail: '/clips/twix.mp4',
      themeColor: '#f59e0b',
      logo: '/logos/nfttwix-logo.png'
    },
    {
      _key: 'outleadership',
      company: 'Out Leadership',
      role: 'Creative Developer',
      description: "Out Leadership is a global platform for LGBTQ+ business leaders. I led the technical development of their digital presence, focusing on the animation strategy and front-end implementation to create a high-performance, cinematic experience that celebrates the community and their mission.",
      tools: ["Wordpress", "Browserstack", "Lottie", "GSAP - Scroll Trigger"],
      thumbnail: '/clips/outleadership.mp4?v=1',
      themeColor: '#35687e',
      logo: '/logos/outleadship-logo.png'
    },
    {
      _key: 'kovitz',
      company: 'Kovitz',
      role: 'Creative Developer',
      description: "Working at Kovitz, I focused on building and optimizing financial tools and wealth management platforms. My role involved developing complex frontend interfaces using Angular and integrating with a Java/Spring Boot backend to deliver secure, data-rich applications for high-net-worth clients.",
      tools: ["Wordpress", "Browserstack", "GSAP", 'locomotive'],
      thumbnail: '/clips/kovitz.mp4',
      themeColor: '#76817a',
      logo: '/logos/kovitz-logo.svg'
    },
    {
      _key: 'longview',
      company: 'Longview Innovation',
      role: 'Creative Developer',
      description: "I handled the development and animation implementation for the Longview Innovation website, using interactive motion and thoughtful transitions to support a modern, engaging digital experience.",
      tools: ["SPA", "Wordpress", "Browserstack", "GSAP", 'locomotive', 'Highway.js'],
      thumbnail: '/clips/longview.mp4',
      themeColor: '#b04a25',
      logo: '/logos/longview-innovation-logo.svg'
    },
    ...(data.experience?.filter((item: any) =>
      item.company !== 'Apple' &&
      item.company !== 'Meta Reality Labs' &&
      item.company !== 'Patreon' &&
      item.company !== 'Spotify' &&
      item.company !== 'Twix NFT' &&
      item.company !== 'Kovitz' &&
      item.company !== 'Longview Innovation'
    ).map((item: any, index: number) => ({
      ...item,
      tools: item.tools?.length > 0 ? item.tools : mockToolSets[index % mockToolSets.length],
      themeColor: PROJECT_COLORS[(index + 1) % PROJECT_COLORS.length]
    })) || [])
  ];

  const customAbout = [
    {
      _key: "about-block",
      _type: "block",
      children: [
        {
          _key: "about-span",
          _type: "span",
          text: "For the past 15 years, I've had the pleasure of working with exceptional creatives, crafting beautiful, high-performing digital products for major brands—and in recent years, integrating AI automation to create even more seamless and intelligent experiences."
        }
      ],
      markDefs: [],
      style: "normal"
    }
  ];

  return (
    <main className="flex flex-col selection:bg-blue-500/30">

      <div
        className="relative z-20 bg-black mb-[100vh]"
        style={{ boxShadow: '-9px -2px 52px 19px rgb(0 0 0 / 80%)' }}
      >
        <Hero
          title={data.title}
          heroImage={data.heroImage}
          headline={data.headline}
          subHeadline={data.subHeadline}
        />

        <About description={customAbout} />
        {experienceWithTools && <Experience items={experienceWithTools} />}
        <Setup />
      </div>

      <FloatingMenu />

      <Footer
        email={data.footer?.email}
        location="Chicago, IL"
        socialHandle={data.footer?.socialHandle}
      />

    </main>
  );
}
