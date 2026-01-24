import { NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/server-client";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { winner, name, email, game } = body;
        const isHumanWin = winner === 'human';

        // 1. If name and email are provided, create a winner submission
        if (name && email) {
            await serverClient.create({
                _type: "winnerSubmission",
                name,
                email,
                game: game || "tictactoe",
                submittedAt: new Date().toISOString(),
            });
        }

        // 2. Fetch the single gameStats document.
        const query = `*[_type == "gameStats"][0]`;
        const doc = await serverClient.fetch(query);

        if (!doc) {
            // Create if doesn't exist
            const newDoc = await serverClient.create({
                _type: "gameStats",
                totalAiWins: isHumanWin ? 228 : 229,
                totalHumanWins: isHumanWin ? 1 : 0,
            });
            return NextResponse.json({
                totalAiWins: newDoc.totalAiWins,
                totalHumanWins: newDoc.totalHumanWins
            });
        }

        // 3. Increment the counter unless skipped
        if (!body.skipStatsUpdate) {
            const patch = serverClient.patch(doc._id)
                .setIfMissing({
                    totalAiWins: 0,
                    totalHumanWins: 0,
                    tictactoeAiWins: 0,
                    tictactoeHumanWins: 0,
                    pongHumanWins: 0,
                    checkersAiWins: 0,
                    checkersHumanWins: 0,
                    spaceInvadersAiWins: 0,
                    spaceInvadersHumanWins: 0
                });

            const gameType = game || 'tictactoe';

            if (isHumanWin) {
                patch.inc({ totalHumanWins: 1 });
                if (gameType === 'tictactoe') patch.inc({ tictactoeHumanWins: 1 });
                if (gameType === 'pong') patch.inc({ pongHumanWins: 1 });

                if (gameType === 'checkers') patch.inc({ checkersHumanWins: 1 });
                if (gameType === 'spaceinvaders') patch.inc({ spaceInvadersHumanWins: 1 });
            } else {
                patch.inc({ totalAiWins: 1 });
                if (gameType === 'tictactoe') patch.inc({ tictactoeAiWins: 1 });
                if (gameType === 'pong') patch.inc({ pongAiWins: 1 });

                if (gameType === 'checkers') patch.inc({ checkersAiWins: 1 });
                if (gameType === 'spaceinvaders') patch.inc({ spaceInvadersAiWins: 1 });
            }

            const updatedDoc = await patch.commit();

            return NextResponse.json({
                totalAiWins: updatedDoc.totalAiWins,
                totalHumanWins: updatedDoc.totalHumanWins,
                tictactoeAiWins: updatedDoc.tictactoeAiWins,
                tictactoeHumanWins: updatedDoc.tictactoeHumanWins,
                pongAiWins: updatedDoc.pongAiWins,
                pongHumanWins: updatedDoc.pongHumanWins,
                checkersAiWins: updatedDoc.checkersAiWins,

                checkersHumanWins: updatedDoc.checkersHumanWins,
                spaceInvadersAiWins: updatedDoc.spaceInvadersAiWins,
                spaceInvadersHumanWins: updatedDoc.spaceInvadersHumanWins
            });
        }

        // Return current stats without update if skipped
        return NextResponse.json({
            totalAiWins: doc.totalAiWins,
            totalHumanWins: doc.totalHumanWins,
            tictactoeAiWins: doc.tictactoeAiWins,
            tictactoeHumanWins: doc.tictactoeHumanWins,
            pongAiWins: doc.pongAiWins,
            pongHumanWins: doc.pongHumanWins,
            checkersAiWins: doc.checkersAiWins,

            checkersHumanWins: doc.checkersHumanWins,
            spaceInvadersAiWins: doc.spaceInvadersAiWins,
            spaceInvadersHumanWins: doc.spaceInvadersHumanWins
        });
    } catch (error) {
        console.error("Error updating game stats:", error);
        return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const query = `*[_type == "gameStats"][0]`;
        const data = await serverClient.fetch(query);
        return NextResponse.json({
            totalAiWins: data?.totalAiWins || 0,
            totalHumanWins: data?.totalHumanWins || 0,
            tictactoeAiWins: data?.tictactoeAiWins || 0,
            tictactoeHumanWins: data?.tictactoeHumanWins || 0,
            pongAiWins: data?.pongAiWins || 0,
            pongHumanWins: data?.pongHumanWins || 0,
            checkersAiWins: data?.checkersAiWins || 0,

            checkersHumanWins: data?.checkersHumanWins || 0,
            spaceInvadersAiWins: data?.spaceInvadersAiWins || 0,
            spaceInvadersHumanWins: data?.spaceInvadersHumanWins || 0
        });
    } catch (error) {
        console.error("Error fetching game stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
