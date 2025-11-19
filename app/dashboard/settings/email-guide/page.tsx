import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function EmailGuidePage() {
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
        <h1 className="text-3xl font-bold mb-2">Email Notifications Setup</h1>
        <p className="text-muted-foreground">Receive detailed change reports via email using Resend!</p>
      </div>

      {/* Why Resend */}
      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Why Resend?</h3>
              <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                <li>• <strong>Free tier:</strong> 100 emails/day, 3,000/month</li>
                <li>• <strong>Fast delivery:</strong> Sub-second email delivery</li>
                <li>• <strong>Easy setup:</strong> Just one API key needed</li>
                <li>• <strong>Professional:</strong> Custom domains supported</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500">Step 1</Badge>
            <CardTitle>Create a Resend Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside text-sm">
            <li>
              Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline dark:text-purple-400 inline-flex items-center gap-1">
                resend.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Sign up for a free account</li>
            <li>Verify your email address</li>
          </ol>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500">Step 2</Badge>
            <CardTitle>Get Your API Key</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal list-inside text-sm">
            <li>Log in to your Resend dashboard</li>
            <li>Go to <strong>API Keys</strong> in the sidebar</li>
            <li>Click <strong>Create API Key</strong></li>
            <li>Give it a name (e.g., &quot;AI Monitor&quot;)</li>
            <li>Select <strong>Full Access</strong> or <strong>Sending Access</strong></li>
            <li>
              <strong>Copy the API key</strong> (starts with <code className="px-2 py-1 bg-muted rounded text-xs font-mono">re_</code>)
            </li>
          </ol>

          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                ⚠️ <strong>Important:</strong> Copy the key immediately! You won&apos;t be able to see it again.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Step 3 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500">Step 3</Badge>
            <CardTitle>Configure Your Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">Add Environment Variables</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add these to your <code className="px-2 py-1 bg-muted rounded text-xs font-mono">.env.local</code> file:
            </p>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto">
RESEND_API_KEY=re_your_api_key_here{'\n'}
EMAIL_FROM=AI Monitor &lt;notifications@resend.dev&gt;
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Using a Custom Domain (Optional)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              If you have a verified domain in Resend:
            </p>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm">
EMAIL_FROM=AI Monitor &lt;alerts@yourdomain.com&gt;
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Note:</strong> The default <code className="px-1 py-0.5 bg-muted rounded text-xs">onboarding@resend.dev</code> works for testing, but emails might go to spam.
            </p>
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
            <li>Go to <Link href="/dashboard/settings" className="text-purple-600 hover:underline dark:text-purple-400">Dashboard → Settings</Link></li>
            <li>Enter your <strong>Email Address</strong></li>
            <li>Click <strong>Test</strong> to verify it works</li>
            <li>Check your inbox for a test email! 🎉</li>
            <li>Click <strong>Save All Settings</strong></li>
          </ol>

          <Link href="/dashboard/settings">
            <button className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition">
              Go to Settings →
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* What You'll Receive */}
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/50">
        <CardHeader>
          <CardTitle>What You&apos;ll Receive</CardTitle>
          <CardDescription>Beautiful HTML emails with full details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white dark:bg-slate-900 border rounded-lg p-4 text-sm">
            <div className="bg-gradient-to-r from-sky-500 to-purple-500 text-white p-4 rounded-t-lg text-center mb-4">
              <div className="text-lg font-bold">🔔 Change Detected</div>
            </div>
            <div className="space-y-3">
              <p><strong>5</strong> new changes detected on your monitored site.</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs space-y-1">
                <div><strong>Site:</strong> Product Hunt</div>
                <div><strong>Instruction:</strong> Fetch innovative projects with &gt;50 upvotes</div>
                <div><strong>Time:</strong> 11/19/2025, 3:45:12 PM</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-xs">Recent Changes:</h4>
                <div className="space-y-2">
                  <div className="bg-slate-50 dark:bg-slate-800 border-l-2 border-sky-500 p-2 rounded text-xs">
                    <div className="font-semibold text-sky-600">→ New AI Tool for Code Review</div>
                    <div className="text-muted-foreground text-xs">An innovative tool that uses AI...</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border-l-2 border-sky-500 p-2 rounded text-xs">
                    <div className="font-semibold text-sky-600">→ Revolutionary Note-Taking App</div>
                    <div className="text-muted-foreground text-xs">Transform how you take notes...</div>
                  </div>
                </div>
              </div>
              <div className="text-center pt-3">
                <span className="inline-block px-4 py-2 bg-sky-500 text-white rounded text-xs font-medium">
                  View Dashboard
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Free Tier:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• 100 emails/day</li>
              <li>• 3,000 emails/month</li>
              <li>• No credit card required</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Pro Tier:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• 50,000 emails/month for $20</li>
              <li>• Custom volume pricing available</li>
            </ul>
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
            <h4 className="font-semibold text-sm mb-2">❌ &quot;Email service not configured&quot;</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Add <code className="px-1 py-0.5 bg-muted rounded text-xs">RESEND_API_KEY</code> to your <code className="px-1 py-0.5 bg-muted rounded text-xs">.env.local</code> file</li>
              <li>• Restart your development server</li>
              <li>• Verify the key starts with <code className="px-1 py-0.5 bg-muted rounded text-xs">re_</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">❌ Test email not received</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Check your spam/junk folder</li>
              <li>• Verify the email address is correct</li>
              <li>• Make sure your Resend API key is valid</li>
              <li>• Check Resend dashboard for delivery logs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">❌ Emails go to spam</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Verify a custom domain in Resend (recommended)</li>
              <li>• Update <code className="px-1 py-0.5 bg-muted rounded text-xs">EMAIL_FROM</code> to use your verified domain</li>
              <li>• Add SPF, DKIM records (Resend provides these)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Verify Domain */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
        <CardHeader>
          <CardTitle>Verify Domain (Recommended for Production)</CardTitle>
          <CardDescription>Better email deliverability with your own domain</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li>Go to Resend dashboard → <strong>Domains</strong></li>
            <li>Click <strong>Add Domain</strong></li>
            <li>Enter your domain (e.g., <code className="px-1 py-0.5 bg-muted rounded text-xs">yourdomain.com</code>)</li>
            <li>Add the DNS records Resend provides:
              <ul className="ml-6 mt-1 space-y-1 list-disc">
                <li><strong>SPF record:</strong> Prevents spoofing</li>
                <li><strong>DKIM record:</strong> Verifies authenticity</li>
                <li><strong>DMARC record:</strong> Reports issues</li>
              </ul>
            </li>
            <li>Wait for verification (usually &lt; 5 minutes)</li>
            <li>Update <code className="px-1 py-0.5 bg-muted rounded text-xs">EMAIL_FROM</code> to use your domain</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

