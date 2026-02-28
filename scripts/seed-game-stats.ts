// One-time script to seed game stats with realistic numbers
// Run: npx tsx scripts/seed-game-stats.ts

import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN!,
});

async function seed() {
    // Find the existing gameStats doc
    const doc = await client.fetch(`*[_type == "gameStats"][0]`);

    if (!doc) {
        console.error('No gameStats document found. Create one first.');
        process.exit(1);
    }

    // Realistic per-game wins — Nash (AI) wins more, but humans win some too
    const stats = {
        // Tic-Tac-Toe: Most played game, Nash dominates but draws are common
        tictactoeAiWins: 312,
        tictactoeHumanWins: 87,

        // Pong: Fast-paced, humans can win with reflexes
        pongAiWins: 198,
        pongHumanWins: 134,

        // Checkers: Strategic, Nash has edge but humans take some
        checkersAiWins: 156,
        checkersHumanWins: 41,

        // Space Invaders: Score-based, humans do well here
        spaceInvadersAiWins: 89,
        spaceInvadersHumanWins: 72,
    };

    // Total wins = sum of all individual game wins
    const totalAiWins = stats.tictactoeAiWins + stats.pongAiWins + stats.checkersAiWins + stats.spaceInvadersAiWins;
    const totalHumanWins = stats.tictactoeHumanWins + stats.pongHumanWins + stats.checkersHumanWins + stats.spaceInvadersHumanWins;

    const updated = await client.patch(doc._id).set({
        ...stats,
        totalAiWins,
        totalHumanWins,
    }).commit();

    console.log('✅ Game stats seeded successfully!');
    console.log(`   Nash (AI): ${totalAiWins} total wins`);
    console.log(`   Humans:    ${totalHumanWins} total wins`);
    console.log('   Per-game breakdown:');
    console.log(`     Tic-Tac-Toe:     Nash ${stats.tictactoeAiWins} — Human ${stats.tictactoeHumanWins}`);
    console.log(`     Pong:            Nash ${stats.pongAiWins} — Human ${stats.pongHumanWins}`);
    console.log(`     Checkers:        Nash ${stats.checkersAiWins} — Human ${stats.checkersHumanWins}`);
    console.log(`     Space Invaders:  Nash ${stats.spaceInvadersAiWins} — Human ${stats.spaceInvadersHumanWins}`);
}

seed().catch(console.error);
