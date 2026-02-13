import { Resend } from 'resend';

// Lazy initialization - only create Resend instance when needed
let resend: Resend | null = null;

function getResendClient() {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export async function sendWinnerNotification(
    name: string,
    email: string,
    game: string
) {
    const client = getResendClient();

    if (!client) {
        console.warn('RESEND_API_KEY not configured. Skipping email notification.');
        return;
    }

    // Sanitize inputs for safe HTML embedding
    const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeEmail = email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeGame = game.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    try {
        await client.emails.send({
            from: 'Game Notifications <onboarding@resend.dev>', // You'll update this after domain verification
            to: 'mikeyscimeca.dev@gmail.com',
            subject: `🎉 New Winner: ${safeName} beat the ${safeGame} AI!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0158ff;">🎮 New Game Winner!</h2>
          <p>Someone just beat your AI!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Game:</strong> ${safeGame}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This winner submission has been saved to your Sanity database.
          </p>
        </div>
      `,
        });

        console.log(`✅ Winner notification sent for ${name} (${game})`);
    } catch (error) {
        console.error('Failed to send winner notification:', error);
        // Don't throw - we don't want email failures to break the API
    }
}
