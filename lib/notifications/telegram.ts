/**
 * Telegram notification service
 * Sends alerts to Telegram when changes are detected
 */

interface TelegramMessage {
  chatId: string;
  text: string;
}

interface TelegramChangeMessage {
  chatId: string;
  title: string;
  url: string;
  changes: number;
  instruction: string;
  timestamp: Date;
}

// Simple message sender (used by scraper)
export const sendTelegramMessage = async (message: TelegramMessage): Promise<boolean> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.warn("[Telegram] Bot token not configured, skipping notification");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: message.chatId,
          text: message.text,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("[Telegram] API error:", data);
      return false;
    }

    console.log(`[Telegram] ✓ Message sent to chat ${message.chatId}`);
    return true;
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    return false;
  }
};

// Detailed change notification
export const sendTelegramNotification = async (message: TelegramChangeMessage): Promise<boolean> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.warn("[Telegram] Bot token not configured, skipping notification");
    return false;
  }

  try {
    const text = formatTelegramMessage(message);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: message.chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("[Telegram] API error:", data);
      return false;
    }

    console.log(`[Telegram] ✓ Notification sent to chat ${message.chatId}`);
    return true;
  } catch (error) {
    console.error("[Telegram] Failed to send notification:", error);
    return false;
  }
};

const formatTelegramMessage = (message: TelegramChangeMessage): string => {
  const { title, url, changes, instruction, timestamp } = message;
  
  return `🔔 *Change Detected!*\n\n` +
    `*Site:* ${escapeMarkdown(title)}\n` +
    `*Changes:* ${changes} new item${changes > 1 ? 's' : ''}\n` +
    `*Instruction:* ${escapeMarkdown(instruction)}\n\n` +
    `🔗 [View Site](${url})\n\n` +
    `⏰ _${timestamp.toLocaleString()}_`;
};

// Escape special Markdown characters for Telegram
const escapeMarkdown = (text: string): string => {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
};

export const sendTelegramAlert = async (
  chatId: string,
  siteName: string,
  siteUrl: string,
  changeCount: number,
  instruction: string
): Promise<boolean> => {
  return sendTelegramNotification({
    chatId,
    title: siteName,
    url: siteUrl,
    changes: changeCount,
    instruction,
    timestamp: new Date(),
  });
};
