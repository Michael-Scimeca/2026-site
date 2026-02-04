import { createClient } from 'next-sanity'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
})

const MOCK_DATA = {
    title: "Michael Scimeca",
    headline: "Creative Developer & Designer",
    subHeadline: "Building polished digital experiences with a focus on motion and interaction.",
    heroImage: "hero-portrait.png", // In public
    about: [
        {
            _key: "block1",
            _type: "block",
            children: [
                {
                    _type: "span",
                    text: "For the past 15 years, I&apos;ve had the pleasure of working with exceptional creatives, crafting beautiful, high-performing digital products for major brands—and in recent years, integrating AI automation to create even more seamless and intelligent experiences."
                }
            ]
        },
        {
            _key: "block2",
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
            company: "Patreon",
            role: "For Halloween 2021, I led the animation strategy, development, and implementation for Trick-or-True Crime, an interactive microsite created with Patreon to celebrate the thrill of true crime content. The experience invited visitors to explore eerie, crime-filled streets where each door revealed either a chilling surprise or an enticing prize, balancing suspense with playful discovery. Using immersive Lottie animations and horizontal scrolling, the site blended cinematic storytelling and interactive technology to deliver a dark, memorable Halloween experience.",
            thumbnail: "clips/patreon.mp4",
            description: []
        },
        {
            _key: "2",
            company: "Twix NFT",
            role: "Working at RSQ, I contributed to the strategy and implementation of a campaign site developed in collaboration with Mars, Inc. and their PR agency to launch #NFTwix — TWIX’s first-ever NFT drop. Partnering with artist YEAHYEAHCHLOE and hosted on MakersPlace, the experience transformed the iconic candy rivalry into a digital art moment featuring two visually identical yet provably unique NFTs on the blockchain. To amplify the campaign, we built a sleek split-screen website where fans could choose their side and compete for exclusive prizes, blending strategic thinking with interactive web execution.",
            dateRange: "21' — 21'",
            creditLabel: "Record a Podcast",
            creditLinks: "Tech Crunch",
            thumbnail: "clips/twix.mp4",
            description: []
        },

        {
            _key: "4",
            company: "Kovitz",
            role: "Frontend Developer",
            dateRange: "18' — 19'",
            creditLabel: "Wealth Management",
            creditLinks: "Kovitz, Financial Tools",
            thumbnail: "clips/kovitz.mp4",
            tools: ["Angular", "Spring Boot", "SQL", "Java", "Netflix OSS"],
            description: []
        },
        {
            _key: "5",
            company: "Longview Innovation",
            role: "Creative Developer",
            dateRange: "24' — Present",
            creditLabel: "Collaboration is our capital",
            creditLinks: "Harnessing the power of engineered macrophages",
            thumbnail: "clips/longview.mp4",
            tools: ["Next.js", "GSAP", "Three.js", "Tailwind CSS", "Sanity"],
            description: []
        }
    ],
    timeline: [
        {
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
        email: "mikeyscimeca.dev@gmail.com",
        location: "Chicago, IL",
    }
};

async function uploadAsset(filePath: string, type: 'image' | 'file' = 'image') {
    const absolutePath = path.join(process.cwd(), 'public', filePath)
    if (!fs.existsSync(absolutePath)) {
        console.warn(`File not found: ${absolutePath}`)
        return null
    }
    const buffer = fs.readFileSync(absolutePath)
    console.log(`Uploading ${filePath}...`)
    return client.assets.upload(type, buffer, { filename: path.basename(filePath) })
}

async function seed() {
    console.log('Seeding data...')

    // Upload hero image
    const heroAsset = await uploadAsset(MOCK_DATA.heroImage, 'image')

    // Upload experience thumbnails
    const experienceWithAssets = await Promise.all(MOCK_DATA.experience.map(async (item) => {
        // Determine type based on extension
        const isVideo = item.thumbnail.endsWith('.mp4')
        const assetType = isVideo ? 'file' : 'image'

        const asset = await uploadAsset(item.thumbnail, assetType)
        return {
            _type: 'experience',
            _key: item._key,
            company: item.company,
            role: item.role,
            dateRange: item.dateRange,
            creditLabel: item.creditLabel,
            creditLinks: item.creditLinks,
            thumbnail: asset ? {
                _type: 'file',
                asset: {
                    _type: "reference",
                    _ref: asset._id
                }
            } : undefined,
            description: item.description,
            tools: (item as any).tools || []
        }
    }))

    const timelineItems = MOCK_DATA.timeline.map((item, idx) => ({
        _type: 'timelineItem',
        _key: `timeline-${idx}`,
        company: item.company,
        date: item.date,
        roles: item.roles.map((r, rIdx) => ({
            _key: `role-${rIdx}`,
            title: r.title,
            description: r.description
        }))
    }))

    const doc = {
        _type: 'homePage',
        title: MOCK_DATA.title,
        headline: MOCK_DATA.headline,
        subHeadline: MOCK_DATA.subHeadline,
        heroImage: heroAsset ? {
            _type: 'image',
            asset: {
                _type: "reference",
                _ref: heroAsset._id
            },
            alt: "Michael Scimeca Portrait"
        } : undefined,
        about: MOCK_DATA.about,
        experience: experienceWithAssets,
        timeline: timelineItems,
        footer: MOCK_DATA.footer
    }

    const existing = await client.fetch(`*[_type == "homePage"][0]`)
    if (existing) {
        console.log('Home Page data exists. Updating...', existing._id)
        await client.patch(existing._id).set(doc).commit()
        console.log('Updated Home Page document:', existing._id)
    } else {
        const res = await client.create(doc)
        console.log('Created Home Page document:', res._id)
    }
}

seed().catch((err) => {
    console.error(err)
    process.exit(1)
})
