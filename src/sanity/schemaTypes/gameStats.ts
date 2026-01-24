import { defineField, defineType } from "sanity";

export const gameStats = defineType({
    name: "gameStats",
    title: "Game Stats",
    type: "document",
    fields: [
        defineField({
            name: "totalAiWins",
            title: "Total AI Wins (Legacy)",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "totalHumanWins",
            title: "Total Human Wins (Legacy)",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "tictactoeAiWins",
            title: "Tic-Tac-Toe AI Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "tictactoeHumanWins",
            title: "Tic-Tac-Toe Human Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "pongAiWins",
            title: "Pong AI Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "pongHumanWins",
            title: "Pong Human Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "checkersAiWins",
            title: "Checkers AI Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "checkersHumanWins",
            title: "Checkers Human Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "spaceInvadersAiWins",
            title: "Space Invaders AI Wins",
            type: "number",
            initialValue: 0,
        }),
        defineField({
            name: "spaceInvadersHumanWins",
            title: "Space Invaders Human Wins",
            type: "number",
            initialValue: 0,
        }),
    ],
});
