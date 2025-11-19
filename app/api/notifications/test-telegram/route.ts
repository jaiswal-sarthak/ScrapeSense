import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await request.json();

  if (!chatId) {
    return NextResponse.json({ message: "Chat ID is required" }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { message: "Telegram bot not configured. Please add TELEGRAM_BOT_TOKEN to your environment variables." },
      { status: 500 }
    );
  }

  try {
    const message = `✨ *Test Message from AI Monitor*\n\n` +
      `Great! Your Telegram notifications are working perfectly.\n\n` +
      `You'll receive alerts here when changes are detected on your monitored sites.\n\n` +
      `_User: ${session.user.email}_`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      throw new Error(data.description || "Failed to send message to Telegram");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test message sent successfully!" 
    });
  } catch (error) {
    console.error("Telegram test error:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Failed to send test message",
        hint: "Make sure your Chat ID is correct and the bot is configured properly."
      },
      { status: 500 }
    );
  }
}

