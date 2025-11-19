/**
 * Email notification service using Resend
 * Sends detailed change reports via email
 */

interface SimpleEmailMessage {
  to: string;
  subject: string;
  html: string;
}

interface EmailMessage {
  to: string;
  siteName: string;
  siteUrl: string;
  changes: number;
  instruction: string;
  changeDetails?: Array<{ title: string; url: string; description?: string }>;
  timestamp: Date;
}

// Simple email sender (used by scraper)
export const sendAlertEmail = async (message: SimpleEmailMessage): Promise<boolean> => {
  const resendKey = process.env.RESEND_API_KEY;
  
  if (!resendKey) {
    console.warn("[Email] Resend API key not configured, skipping notification");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "AI Monitor <notifications@resend.dev>",
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Email] API error:", data);
      return false;
    }

    console.log(`[Email] ✓ Alert sent to ${message.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send alert:", error);
    return false;
  }
};

// Detailed change notification
export const sendEmailNotification = async (message: EmailMessage): Promise<boolean> => {
  const resendKey = process.env.RESEND_API_KEY;
  
  if (!resendKey) {
    console.warn("[Email] Resend API key not configured, skipping notification");
    return false;
  }

  try {
    const html = generateEmailHTML(message);
    const subject = `🔔 ${message.changes} Change${message.changes > 1 ? 's' : ''} Detected on ${message.siteName}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "AI Monitor <notifications@resend.dev>",
        to: [message.to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Email] API error:", data);
      return false;
    }

    console.log(`[Email] ✓ Notification sent to ${message.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send notification:", error);
    return false;
  }
};

const generateEmailHTML = (message: EmailMessage): string => {
  const { siteName, siteUrl, changes, instruction, changeDetails, timestamp } = message;

  const changesHTML = changeDetails
    ? changeDetails.slice(0, 10).map(change => `
        <div style="background: #f9fafb; border-left: 3px solid #0ea5e9; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #1f2937;">
            <a href="${change.url}" style="color: #0ea5e9; text-decoration: none;">${change.title}</a>
          </h4>
          ${change.description ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${change.description}</p>` : ''}
        </div>
      `).join('')
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Change Detected</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
            <strong>${changes}</strong> new change${changes > 1 ? 's' : ''} detected on your monitored site.
          </p>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 100px;">Site:</td>
                <td style="padding: 6px 0;">
                  <a href="${siteUrl}" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">${siteName}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Instruction:</td>
                <td style="padding: 6px 0; color: #1f2937;">${instruction}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">Time:</td>
                <td style="padding: 6px 0; color: #1f2937;">${timestamp.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          ${changesHTML ? `
            <h3 style="color: #1f2937; margin-bottom: 16px;">Recent Changes:</h3>
            ${changesHTML}
            ${changeDetails && changeDetails.length > 10 ? `
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 16px;">
                ... and ${changeDetails.length - 10} more changes
              </p>
            ` : ''}
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/results" 
               style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              View Dashboard
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>You're receiving this because you enabled email notifications in your AI Monitor settings.</p>
        </div>
      </body>
    </html>
  `;
};

export const sendEmailAlert = async (
  email: string,
  siteName: string,
  siteUrl: string,
  changeCount: number,
  instruction: string,
  changes?: Array<{ title: string; url: string; description?: string }>
): Promise<boolean> => {
  return sendEmailNotification({
    to: email,
    siteName,
    siteUrl,
    changes: changeCount,
    instruction,
    changeDetails: changes,
    timestamp: new Date(),
  });
};
