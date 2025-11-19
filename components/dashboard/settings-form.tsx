"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, XCircle, Send, AlertCircle } from "lucide-react";
import { settingsSchema, type SettingsPayload } from "@/lib/validators/task";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SettingsForm = ({
  defaults,
}: {
  defaults?: SettingsPayload;
}) => {
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string | null }>({
    type: null,
    message: null,
  });
  const [testing, setTesting] = useState<"telegram" | "email" | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      alertThreshold: 1,
      ...defaults,
    },
  });

  const telegramChatId = watch("telegramChatId");
  const notificationEmail = watch("notificationEmail");

  const onSubmit = async (data: SettingsPayload) => {
    setStatus({ type: null, message: null });
    try {
      const res = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Failed to save settings");
      }
      setStatus({ type: "success", message: "✓ Settings saved successfully!" });
      setTimeout(() => setStatus({ type: null, message: null }), 3000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save settings",
      });
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setStatus({ type: "error", message: "Please enter a Telegram Chat ID first" });
      return;
    }
    
    setTesting("telegram");
    setStatus({ type: null, message: null });
    
    try {
      const res = await fetch("/api/notifications/test-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: telegramChatId }),
      });

      const body = await res.json();
      
      if (!res.ok) {
        throw new Error(body.message || "Failed to send test message");
      }

      setStatus({ type: "success", message: "✓ Test message sent! Check your Telegram." });
      setTimeout(() => setStatus({ type: null, message: null }), 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send test message",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleTestEmail = async () => {
    if (!notificationEmail) {
      setStatus({ type: "error", message: "Please enter an email address first" });
      return;
    }
    
    setTesting("email");
    setStatus({ type: null, message: null });
    
    try {
      const res = await fetch("/api/notifications/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: notificationEmail }),
      });

      const body = await res.json();
      
      if (!res.ok) {
        throw new Error(body.message || "Failed to send test email");
      }

      setStatus({ type: "success", message: "✓ Test email sent! Check your inbox." });
      setTimeout(() => setStatus({ type: null, message: null }), 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send test email",
      });
    } finally {
      setTesting(null);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Status Alert */}
      {status.message && (
        <Card className={`border ${status.type === "success" ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950" : "border-red-500/50 bg-red-50 dark:bg-red-950"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {status.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <p className={`text-sm ${status.type === "success" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                {status.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Telegram Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Telegram Notifications</CardTitle>
              <CardDescription className="mt-1">
                Get instant alerts in Telegram when changes are detected
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Real-time
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="telegramChatId"
                placeholder="123456789"
                {...register("telegramChatId")}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestTelegram}
                disabled={!telegramChatId || testing === "telegram"}
                className="gap-2"
              >
                {testing === "telegram" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Test
              </Button>
            </div>
            {errors.telegramChatId && (
              <p className="text-xs text-red-500">{errors.telegramChatId.message}</p>
            )}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-xs">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                How to get your Chat ID:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Open Telegram and search for <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">@userinfobot</code></li>
                <li>Start a conversation with the bot</li>
                <li>Copy your Chat ID from the bot&apos;s response</li>
                <li>Paste it above and click &quot;Test&quot;</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription className="mt-1">
                Receive detailed change reports via email
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Digest
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="notificationEmail"
                type="email"
                placeholder="alerts@yourcompany.com"
                {...register("notificationEmail")}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
                disabled={!notificationEmail || testing === "email"}
                className="gap-2"
              >
                {testing === "email" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Test
              </Button>
            </div>
            {errors.notificationEmail && (
              <p className="text-xs text-red-500">{errors.notificationEmail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Threshold */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-base">Alert Threshold</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Minimum number of changes required to trigger an alert
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alertThreshold">Number of Changes</Label>
            <Input
              id="alertThreshold"
              type="number"
              min={1}
              max={50}
              {...register("alertThreshold", { valueAsNumber: true })}
              className="w-full"
            />
            {errors.alertThreshold && (
              <p className="text-xs text-red-500">{errors.alertThreshold.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You&apos;ll be notified when at least this many changes are detected in a single scrape run.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button type="submit" className="w-full gap-2" disabled={isSubmitting} size="lg">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Save All Settings
      </Button>
    </form>
  );
};
