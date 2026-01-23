import { defineField, defineType } from "sanity";

export const gameStats = defineType({
    name: "gameStats",
    title: "Game Stats",
    type: "document",
    fields: [
        defineField({
            name: "totalAiWins",
            title: "Total AI Wins",
            type: "number",
            initialValue: 0,
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: "totalHumanWins",
            title: "Total Human Wins",
            type: "number",
            initialValue: 0,
            validation: (Rule) => Rule.required().min(0),
        }),
    ],
});
