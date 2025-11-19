import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";

export default async function TelegramGuidePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Telegram Notifications Setup</h1>
        <p className="text-muted-foreground">Get instant alerts when changes are detected on your monitored websites!</p>
      </div>

      {/* Why Telegram */}
      <Card className="border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-950/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
              <svg className="h-6 w-6 text-sky-600 dark:text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-2">Why Telegram?</h3>
              <ul className="space-y-1 text-sm text-sky-800 dark:text-sky-200">
                <li>• <strong>Instant notifications</strong> - Get alerts in seconds</li>
                <li>• <strong>100% Free</strong> - No limits, no subscriptions</li>
                <li>• <strong>Mobile & Desktop</strong> - Works everywhere</li>
                <li>• <strong>Group support</strong> - Share alerts with your team</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-sky-500">Step 1</Badge>
            <CardTitle>Create Your Telegram Bot</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-sm">
              Open Telegram and search for <code className="px-2 py-1 bg-muted rounded text-xs font-mono">@BotFather</code>
              <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline dark:text-sky-400">
                <ExternalLink className="h-3 w-3" />
                Open in Telegram
              </a>
            </li>
            <li className="text-sm">Start a conversation and send <code className="px-2 py-1 bg-muted rounded text-xs font-mono">/newbot</code></li>
            <li className="text-sm">
              Follow the prompts:
              <ul className="mt-2 ml-6 space-y-1 list-disc">
                <li>Give your bot a name (e.g., &quot;My AI Monitor&quot;)</li>
                <li>Give your bot a username (must end in &apos;bot&apos;, e.g., &quot;myaimonitor_bot&quot;)</li>
              </ul>
            </li>
            <li className="text-sm">
              <strong>Copy the Bot Token</strong> you receive (looks like <code className="px-2 py-1 bg-muted rounded text-xs font-mono">123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code>)
            </li>
          </ol>

          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                ⚠️ <strong>Important:</strong> Keep your bot token secure! You&apos;ll need to add it to your environment variables.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-sky-500">Step 2</Badge>
            <CardTitle>Get Your Chat ID</CardTitle>
          </div>
          <CardDescription>Choose the easiest method for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method 1 */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Method 1: Using @userinfobot (Easiest)
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-sm ml-6">
              <li>
                Search for <code className="px-2 py-1 bg-muted rounded text-xs font-mono">@userinfobot</code> in Telegram
                <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline dark:text-sky-400">
                  <ExternalLink className="h-3 w-3" />
                  Open in Telegram
                </a>
              </li>
              <li>Start a conversation with the bot</li>
              <li>It will automatically send you your Chat ID</li>
              <li>Copy the number (e.g., <code className="px-2 py-1 bg-muted rounded text-xs font-mono">123456789</code>)</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-sm mb-3">Method 2: Manual Method</h4>
            <ol className="space-y-2 list-decimal list-inside text-sm ml-6">
              <li>Start a conversation with <strong>your bot</strong> (the one you just created)</li>
              <li>Send any message to your bot</li>
              <li>
                Open this URL in your browser (replace <code className="text-xs">YOUR_BOT_TOKEN</code>):
                <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
                  https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
                </pre>
              </li>
              <li>Look for <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{`"chat":{"id":123456789}`}</code> in the response</li>
              <li>Copy that ID number</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Step 3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-sky-500">Step 3</Badge>
            <CardTitle>Configure Your Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Add Environment Variable</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add this to your <code className="px-2 py-1 bg-muted rounded text-xs font-mono">.env.local</code> file:
            </p>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm">
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
            </pre>
            <p className="text-xs text-muted-foreground mt-2">Replace with your actual bot token from Step 1.</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Restart Your Application</h4>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm">
npm run dev
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Step 4 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500">Step 4</Badge>
            <CardTitle>Configure in Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li>Go to <Link href="/dashboard/settings" className="text-sky-600 hover:underline dark:text-sky-400">Dashboard → Settings</Link></li>
            <li>Enter your <strong>Chat ID</strong> (from Step 2)</li>
            <li>Click <strong>Test</strong> to verify it works</li>
            <li>You should receive a test message in Telegram! 🎉</li>
            <li>Click <strong>Save All Settings</strong></li>
          </ol>

          <Link href="/dashboard/settings">
            <button className="w-full px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition">
              Go to Settings →
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* What You'll Receive */}
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/50">
        <CardHeader>
          <CardTitle>What You&apos;ll Receive</CardTitle>
          <CardDescription>Example notification messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-slate-900 border rounded-lg p-4 font-mono text-sm">
            <div className="text-emerald-600 dark:text-emerald-400">🔔 <strong>Change Detected!</strong></div>
            <div className="mt-2 space-y-1 text-xs">
              <div><strong>Site:</strong> Product Hunt</div>
              <div><strong>Changes:</strong> 5 new items</div>
              <div><strong>Instruction:</strong> Fetch innovative projects with &gt;50 upvotes</div>
              <div className="mt-2">🔗 <span className="text-sky-500">View Site</span></div>
              <div className="mt-2 text-muted-foreground">⏰ <em>11/19/2025, 3:45:12 PM</em></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">❌ &quot;Failed to send message&quot;</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Make sure you&apos;ve started a conversation with your bot</li>
              <li>• Verify your Chat ID is correct</li>
              <li>• Check that your bot token is valid</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">❌ &quot;Bot token not configured&quot;</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Add <code className="px-1 py-0.5 bg-muted rounded text-xs">TELEGRAM_BOT_TOKEN</code> to your <code className="px-1 py-0.5 bg-muted rounded text-xs">.env.local</code> file</li>
              <li>• Restart your development server</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">❌ &quot;Chat not found&quot;</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Start a conversation with your bot first</li>
              <li>• Send at least one message to the bot</li>
              <li>• Use @userinfobot to double-check your Chat ID</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* For Group Chats */}
      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/50">
        <CardHeader>
          <CardTitle>For Group Chats</CardTitle>
          <CardDescription>Share alerts with your team</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li>Add your bot to the group</li>
            <li>Make the bot an admin (for full permissions)</li>
            <li>Get the group Chat ID (will be negative, like <code className="px-2 py-1 bg-muted rounded text-xs font-mono">-1001234567890</code>)</li>
            <li>Use that negative number in your settings</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

