import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  const settings = await db.getSettings(session.user.id).catch((error) => {
    console.error("Failed to load settings", error);
    return null;
  });

  return (
    <div className="max-w-4xl">
      {/* Setup Guides */}
      <Card className="border-white/20 mb-6 bg-gradient-to-br from-sky-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
              <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">First Time Setup?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Follow our step-by-step guides to configure notifications:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/settings/telegram-guide">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/70 border border-sky-200 text-sky-700 hover:bg-white dark:bg-slate-800/70 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-slate-800 transition">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Telegram Setup Guide
                  </button>
                </Link>
                <Link href="/dashboard/settings/email-guide">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/70 border border-purple-200 text-purple-700 hover:bg-white dark:bg-slate-800/70 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-slate-800 transition">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email Setup Guide
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <SettingsForm
        defaults={{
          telegramChatId: settings?.telegram_chat_id ?? "",
          notificationEmail: settings?.notification_email ?? "",
          alertThreshold: settings?.alert_threshold ?? 1,
        }}
      />
    </div>
  );
}

