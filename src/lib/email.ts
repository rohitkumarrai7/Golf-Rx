import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Golf Charity Platform <noreply@golfcharity.app>';

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Golf Charity Platform!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Welcome, ${name}!</h1>
          <p>Thank you for joining the Golf Charity Subscription Platform.</p>
          <p>Here's what you can do now:</p>
          <ul>
            <li>Enter your golf scores in Stableford format</li>
            <li>Choose a charity to support</li>
            <li>Participate in our monthly prize draws</li>
          </ul>
          <p>Head to your dashboard to get started!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #e8a838; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendDrawResultsEmail(email: string, name: string, drawDate: string, matched: number) {
  try {
    const matchText = matched >= 3
      ? `Congratulations! You matched ${matched} numbers!`
      : `You matched ${matched} numbers this month. Better luck next time!`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Draw Results for ${drawDate}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Monthly Draw Results</h1>
          <p>Hi ${name},</p>
          <p>${matchText}</p>
          ${matched >= 3 ? `
            <p>Please log in to your dashboard to verify your win and claim your prize.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="display: inline-block; background: #e8a838; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;">
              Claim Your Prize
            </a>
          ` : ''}
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send draw results email:', error);
  }
}

export async function sendWinnerAlertEmail(email: string, name: string, matchType: number, amount: number) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You're a Winner! ${matchType}-Number Match`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e8a838;">Congratulations, ${name}!</h1>
          <p>You've won with a <strong>${matchType}-Number Match</strong>!</p>
          <p style="font-size: 24px; font-weight: bold; color: #1a1a2e;">
            Prize: £${amount.toFixed(2)}
          </p>
          <h2>Next Steps:</h2>
          <ol>
            <li>Log into your dashboard</li>
            <li>Upload a screenshot of your scores from your golf platform</li>
            <li>Our admin team will verify your submission</li>
            <li>Once approved, your payout will be processed</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #e8a838; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-weight: bold;">
            Upload Proof
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send winner alert email:', error);
  }
}

export async function sendPayoutConfirmationEmail(email: string, name: string, amount: number) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Prize Payout Has Been Processed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a2e;">Payout Confirmed</h1>
          <p>Hi ${name},</p>
          <p>Your prize payout of <strong>£${amount.toFixed(2)}</strong> has been processed.</p>
          <p>Thank you for being part of the Golf Charity Platform!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send payout confirmation email:', error);
  }
}
