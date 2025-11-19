import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";
import { SignInActions } from "@/components/dashboard/signin-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-lg border-border/70">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles />
          </div>
          <CardTitle className="text-2xl font-semibold">Secure login</CardTitle>
          <CardDescription>
            Connect with Google or request a passwordless link. Your account is protected with Supabase Row Level Security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignInActions />
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <Shield className="h-4 w-4" />
              <span>Security highlights</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>All API routes rate-limited & CSRF protected.</li>
              <li>Supabase RLS ensures you only see your data.</li>
              <li>Groq & Playwright calls are sandboxed per user.</li>
            </ul>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Need an account? Login with email to auto-provision or{" "}
            <Link className="text-primary underline-offset-4 hover:underline" href="/">
              learn more
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
