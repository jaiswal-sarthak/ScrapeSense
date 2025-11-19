import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: "Email address is required" }, { status: 400 });
  }

  // Check if Resend is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { 
        message: "Email service not configured. Please add RESEND_API_KEY to your environment variables.",
        hint: "Sign up at resend.com to get your API key."
      },
      { status: 500 }
    );
  }

  try {
    // Use Resend API to send test email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "AI Monitor <onboarding@resend.dev>",
        to: [email],
        subject: "✅ Test Email from AI Monitor",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">🎉 Success!</h2>
            <p>Your email notifications are configured correctly.</p>
            <p>You'll receive alerts at this address when changes are detected on your monitored websites.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>User:</strong> ${session.user.email}<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This is a test message from your AI Monitor dashboard.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send test email");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully!",
      emailId: data.id 
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Failed to send test email",
        hint: "Please verify your email configuration and try again."
      },
      { status: 500 }
    );
  }
}

