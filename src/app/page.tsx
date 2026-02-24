import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { LogoTicker } from "@/components/LogoTicker";
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
      _key: 'longview',
      company: 'Longview Innovation',
      role: 'Creative Developer',
      description: "I handled the development and animation implementation for the Longview Innovation website, using interactive motion and thoughtful transitions to support a modern, engaging digital experience.",
      tools: ["SPA", "Wordpress", "Browserstack", "GSAP", 'locomotive', 'Highway.js'],
      thumbnail: '/clips/longview.mp4',
      themeColor: '#da6c40',
      logo: '/logos/longview-innovation-logo.svg',
      badge: 'Motion-driven experience',
      badgeEmoji: '🚀',
    },
    {
      _key: 'twix',
      company: 'Twix NFT',
      description: "Working at RSQ, I contributed to the strategy and implementation of #NFTwix, TWIX’s first-ever NFT drop, developed with Mars, Inc. Partnering with artist YEAHYEAHCHLOE and hosted on MakersPlace, the campaign featured a split-screen interactive site where fans chose sides and competed for exclusive prizes.",
      role: 'Creative Developer',
      tools: ["Wordpress", "Browserstack", "GSAP", 'Lenis', 'Barba.js'],
      thumbnail: '/clips/twix.mp4',
      themeColor: '#f59e0b',
      logo: '/logos/nfttwix-logo.png',
      badge: 'NFT campaign launch',
      badgeEmoji: '🎨',
    },
    {
      _key: 'outleadership',
      company: 'Out Leadership',
      role: 'Creative Developer',
      description: "Out Leadership is a global platform for LGBTQ+ business leaders. I led the technical development of their digital presence, focusing on the animation strategy and front-end implementation to create a high-performance, cinematic experience that celebrates the community and their mission.",
      tools: ["Wordpress", "Browserstack", "Lottie", "GSAP - Scroll Trigger"],
      thumbnail: '/clips/outleadership.mp4?v=1',
      themeColor: '#20587a',
      logo: '/logos/outleadship-logo.png',
      badge: 'LGBTQ+ business platform',
      badgeEmoji: '🌈',
    },
    {
      _key: 'kovitz',
      company: 'Kovitz',
      role: 'Creative Developer',
      description: "Working at Kovitz, I focused on building and optimizing financial tools and wealth management platforms. My role involved developing complex frontend interfaces using Angular and integrating with a Java/Spring Boot backend to deliver secure, data-rich applications for high-net-worth clients.",
      tools: ["Wordpress", "Browserstack", "GSAP", 'locomotive'],
      thumbnail: '/clips/kovitz.mp4',
      themeColor: '#76817a',
      logo: '/logos/kovitz-logo.svg',
      badge: 'Wealth management platform',
      badgeEmoji: '📊',
    },
    {
      _key: 'patreon',
      company: 'Patreon',
      role: 'Creative Developer',
      description: "For Halloween 2021, I led the animation strategy and implementation for Trick-or-True Crime, an interactive microsite created with Patreon. Using immersive Lottie animations and horizontal scrolling, the experience blended cinematic storytelling with playful interactivity to deliver a dark, memorable Halloween experience.",
      tools: ["SPA", "Browserstack", "Lottie", "Sanity CMS", "GSAP"],
      thumbnail: '/clips/patreon.mp4',
      themeColor: '#e45253',
      logo: '/logos/patreon-logo.svg',
      badge: 'Interactive microsite',
      badgeEmoji: '🎃',
    },
    {
      _key: 'ripco',
      company: 'RIPCO Real Estate',
      role: 'Creative Developer',
      description: "We connected RIPCO’s internal real estate listings and property data into the website so the content is dynamic, structured, and always up to date. Instead of manually managing listings, the site pulls from a centralized data source that reflects real inventory in real time.",
      tools: ["Wordpress", "Browserstack", "GSAP", "Google Maps API", "Ripco Database"],
      thumbnail: '/clips/ripco.mp4?v=1',
      themeColor: '#e13c46',
      logo: '/logos/ripco-logo.svg',
      badge: 'Real-time property listings',
      badgeEmoji: '🏢',
    },
    // ── Text-only items (no video) ──
    {
      _key: 'optimumnutrition',
      company: 'Optimum Nutrition',
      abbreviation: 'ON',
      role: 'Front-End Development',
      dateRange: '2022',
      description: "Built responsive layouts and interactive enhancements for optimumnutrition.com alongside We Can't Stop Thinking agency — ensuring cross-device reliability and on-brand execution at scale.",
      tools: ["Photoshop", "Custom CMS", "Browserstack", "Foundation"],
      themeColor: '#3c468c',
      logo: '/logos/on.png',
      badge: 'Performance-critical brand site',
      badgeEmoji: '🏋',
      headline: 'Brought a performance-driven brand to life across all devices',
    },
    {
      _key: 'flipboard',
      company: 'Flipboard',
      abbreviation: 'F',
      role: 'Frontend + Animation',
      dateRange: '2021',
      description: "Delivered front-end development and animation implementation for Flipboard's marketing site — creating a visually engaging, responsive presence for one of the world's largest content apps.",
      tools: ["Custom SCSS", "Foundation", "JS Interactions", "Browserstack"],
      themeColor: '#e04040',
      logo: '/logos/flipboard-logo.png',
      badge: 'Motion-driven marketing site',
      badgeEmoji: '🎬',
      headline: 'Animation-first development for a global content platform',
    },
    {
      _key: 'snickers',
      company: 'Snickers',
      abbreviation: 'SNICKERS',
      parentCompany: 'Mars Inc.',
      role: 'Campaign Development',
      dateRange: '2020',
      description: "Built a campaign site celebrating the Snickers brand with dynamic visuals, GSAP animations, and responsive interactive layouts — matching the brand's irreverent, high-energy personality at every scroll.",
      tools: ["Wordpress", "GSAP", "Foundation", "Browserstack"],
      themeColor: '#d4820a',
      logo: '/logos/snickers.png',
      badge: 'High-energy interactive campaign',
      badgeEmoji: '🍬',
      headline: 'One Million SNICKERS — bold, playful, and deeply interactive',
    },
    ...(data.experience?.filter((item: any) => {
      const name = (item.company || '').toLowerCase().trim();
      const key = (item._key || '').toLowerCase();
      const excluded = ['apple', 'meta reality labs', 'patreon', 'spotify', 'twix', 'kovitz', 'longview', 'optimum', 'flipboard', 'snickers', 'one million'];
      return !excluded.some(
        (ex) => name.includes(ex) || key.includes(ex)
      );
    }
    ).map((item: any, index: number) => ({
      ...item,
      tools: item.tools?.length > 0 ? item.tools : mockToolSets[index % mockToolSets.length],
      themeColor: PROJECT_COLORS[(index + 1) % PROJECT_COLORS.length],
      // Text-card fields for items without thumbnails
      ...(!item.thumbnail ? {
        abbreviation: item.company?.split(' ').map((w: string) => w[0]).join('').toUpperCase(),
        headline: typeof item.description === 'string' ? undefined : undefined,
      } : {})
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
    <main id="main-content" className="flex flex-col selection:bg-blue-500/30">

      <div
        className="relative z-20 bg-black"
        style={{ transform: 'translateZ(0)' }}
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



      <div id="footer-reveal-spacer" className="h-screen w-full relative -z-10 pointer-events-none" />

      <FloatingMenu />

      <Footer
        email={data.footer?.email}
        location="Chicago, IL"
        socialHandle={data.footer?.socialHandle}
      />

    </main>
  );
}
