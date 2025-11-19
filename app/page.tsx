import Link from "next/link";
import { ArrowRight, Bot, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Schema Builder",
    description: "Convert plain-language instructions into smart extraction rules.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Smart Monitoring",
    description: "Daily cron runs with change detection, summaries, and insights.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Secure Delivery",
    description: "Supabase RLS, Telegram and Resend alerts, and zero trust defaults.",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12 text-center md:gap-16 md:py-24">
      <div className="fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      <section className="mx-auto w-full max-w-4xl space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.5em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Production ready
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-900 drop-shadow-sm dark:text-white sm:text-5xl">
          AI automated scraping & monitoring built for ops teams
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Describe what to watch, let Groq craft the scraping blueprint, and receive structured data,
          change logs, browser notifications, and alerts automatically.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signin" className="inline-flex items-center gap-2">
              Launch dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard">See live UI</Link>
          </Button>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid w-full max-w-5xl gap-6 text-left md:grid-cols-3"
      >
        {features.map((feature) => (
          <Card key={feature.title} className="border-white/20">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-2xl bg-white/70 p-3 text-slate-700 shadow-sm dark:bg-slate-800/80 dark:text-white">
                {feature.icon}
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500 dark:text-slate-400">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
