import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";

interface NotificationStatusProps {
  hasEmail: boolean;
  hasTelegram: boolean;
}

export const NotificationStatus = ({ hasEmail, hasTelegram }: NotificationStatusProps) => {
  const enabledCount = [hasEmail, hasTelegram].filter(Boolean).length;
  const allEnabled = enabledCount === 2;
  const noneEnabled = enabledCount === 0;

  return (
    <Card className="border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <Badge variant={allEnabled ? "success" : noneEnabled ? "secondary" : "warning"}>
            {enabledCount}/2 Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Telegram Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${hasTelegram ? 'bg-sky-500/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <MessageSquare className={`h-4 w-4 ${hasTelegram ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">Telegram</p>
              <p className="text-xs text-muted-foreground">Instant alerts</p>
            </div>
          </div>
          <Badge variant={hasTelegram ? "success" : "secondary"} className="text-xs">
            {hasTelegram ? "Active" : "Not set"}
          </Badge>
        </div>

        {/* Email Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${hasEmail ? 'bg-purple-500/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <Mail className={`h-4 w-4 ${hasEmail ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">Detailed reports</p>
            </div>
          </div>
          <Badge variant={hasEmail ? "success" : "secondary"} className="text-xs">
            {hasEmail ? "Active" : "Not set"}
          </Badge>
        </div>

        {/* Warning if none enabled */}
        {noneEnabled && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                No notifications configured. You won&apos;t receive alerts when changes are detected.
              </p>
            </div>
          </div>
        )}

        {/* Configure Link */}
        <Link href="/dashboard/settings" className="block">
          <button className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-white/70 border border-white/40 hover:bg-white transition dark:bg-slate-800/60 dark:border-white/10 dark:hover:bg-slate-800">
            {noneEnabled ? "Configure Notifications" : "Manage Settings"}
          </button>
        </Link>
      </CardContent>
    </Card>
  );
};

