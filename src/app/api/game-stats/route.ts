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

        // 3. Increment the counter
        const patch = serverClient.patch(doc._id)
            .setIfMissing({ totalAiWins: 0, totalHumanWins: 0 });

        if (isHumanWin) {
            patch.inc({ totalHumanWins: 1 });
        } else {
            patch.inc({ totalAiWins: 1 });
        }

        const updatedDoc = await patch.commit();

        return NextResponse.json({
            totalAiWins: updatedDoc.totalAiWins,
            totalHumanWins: updatedDoc.totalHumanWins
        });
    } catch (error) {
        console.error("Error updating game stats:", error);
        return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const query = `*[_type == "gameStats"][0] { totalAiWins, totalHumanWins }`;
        const data = await serverClient.fetch(query);
        return NextResponse.json({
            totalAiWins: data?.totalAiWins || 0,
            totalHumanWins: data?.totalHumanWins || 0
        });
    } catch (error) {
        console.error("Error fetching game stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
