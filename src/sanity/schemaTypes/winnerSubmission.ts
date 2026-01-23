import { defineField, defineType } from "sanity";

export const winnerSubmission = defineType({
    name: "winnerSubmission",
    title: "Winner Submission",
    type: "document",
    fields: [
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
            name: "game",
            title: "Game",
            type: "string",
        }),
        defineField({
            name: "submittedAt",
            title: "Submitted At",
            type: "datetime",
            initialValue: () => new Date().toISOString(),
        }),
    ],
});
