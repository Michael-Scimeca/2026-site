import { defineField, defineType } from "sanity";

export const chatVisitor = defineType({
    name: "chatVisitor",
    title: "Chat Visitors",
    type: "document",
    icon: () => "💬",
    fields: [
        defineField({
            name: "visitorId",
            title: "Visitor ID",
            type: "string",
            description: "Unique cookie-based identifier",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "name",
            title: "Name",
            type: "string",
        }),
        defineField({
            name: "email",
            title: "Email",
            type: "string",
        }),
        defineField({
            name: "firstVisit",
            title: "First Visit",
            type: "datetime",
        }),
        defineField({
            name: "lastVisit",
            title: "Last Visit",
            type: "datetime",
        }),
        defineField({
            name: "visitCount",
            title: "Visit Count",
            type: "number",
            initialValue: 1,
        }),
        defineField({
            name: "contactSubmissions",
            title: "Contact Submissions",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "conversations",
            title: "Conversations",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({
                            name: "timestamp",
                            title: "Timestamp",
                            type: "datetime",
                        }),
                        defineField({
                            name: "firstMessage",
                            title: "First Message",
                            type: "string",
                        }),
                        defineField({
                            name: "messageCount",
                            title: "Message Count",
                            type: "number",
                        }),
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: "name",
            subtitle: "email",
            visitCount: "visitCount",
        },
        prepare({ title, subtitle, visitCount }) {
            return {
                title: title || "(Anonymous Visitor)",
                subtitle: `${subtitle || "No email"} • ${visitCount || 1} visit${visitCount !== 1 ? "s" : ""}`,
            };
        },
    },
    orderings: [
        {
            title: "Last Visit (Newest)",
            name: "lastVisitDesc",
            by: [{ field: "lastVisit", direction: "desc" }],
        },
        {
            title: "Most Visits",
            name: "visitCountDesc",
            by: [{ field: "visitCount", direction: "desc" }],
        },
    ],
});
