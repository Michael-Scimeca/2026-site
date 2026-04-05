import type { Metadata } from "next";
import { CV } from "@/components/CV";

export const metadata: Metadata = {
    title: "CV — Michael Scimeca | Web Developer & AI Specialist",
    description:
        "Curriculum Vitæ of Michael Scimeca — AI-powered web developer based in Chicago. 15+ years of experience building premium digital experiences for brands like Snickers, Patreon, Flipboard, and NetherRealm Studios.",
    alternates: {
        canonical: "/cv",
    },
    openGraph: {
        title: "CV — Michael Scimeca | Web Developer & AI Specialist",
        description:
            "Curriculum Vitæ of Michael Scimeca — AI-powered web developer based in Chicago. 15+ years of experience building premium digital experiences.",
        url: "https://michaelscimeca.com/cv",
        type: "profile",
    },
};

export default function CVPage() {
    return <CV />;
}
