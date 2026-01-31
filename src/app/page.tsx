import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Setup } from "@/components/Setup";
import { Footer } from "@/components/Footer";
import { PrivacyModal } from "@/components/PrivacyModal";
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

  const experienceWithTools = [
    {
      _key: 'outleadership',
      company: 'Out Leadership',
      role: 'Technical Lead',
      tools: ["React", "Next.js", "TypeScript", "GSAP", "Tailwind CSS", "Sanity"],
      thumbnail: '/clips/outleadership.mp4?v=1',
      dateRange: '2023 - 2024',
    },
    ...(data.experience?.map((item: any, index: number) => ({
      ...item,
      tools: item.tools?.length > 0 ? item.tools : mockToolSets[index % mockToolSets.length]
    })) || [])
  ];

  return (
    <main className="flex flex-col selection:bg-blue-500/30">
      <PrivacyModal />
      <div className="relative z-20 bg-black mb-[100vh] shadow-xl">
        <Hero
          title={data.title}
          heroImage={data.heroImage}
          headline={data.headline}
          subHeadline={data.subHeadline}
        />

        {data.about && <About description={data.about} />}
        {experienceWithTools && <Experience items={experienceWithTools} />}
        <Setup />
      </div>

      <Footer
        email={data.footer?.email}
        location={data.footer?.location}
        socialHandle={data.footer?.socialHandle}
      />

    </main>
  );
}
