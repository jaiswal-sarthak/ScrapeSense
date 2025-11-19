/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/dashboard/task-form";
import { db } from "@/lib/supabase/queries";
import { TaskList } from "@/components/dashboard/task-list";

export default async function NewTaskPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin");
  }

  // Fetch user's tasks
  const rawTasks = await db.getDashboardData(session.user.id).catch(() => []);
  const tasks = rawTasks.map((t: any) => ({
    ...t,
    site: Array.isArray(t.site) ? t.site[0] : t.site,
    last_run: Array.isArray(t.last_run) ? t.last_run[0] : t.last_run,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create new scraping task</CardTitle>
          <CardDescription>
            Add a website URL and describe what to extract. AI will generate the schema automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your scraping tasks ({tasks.length})</CardTitle>
            <CardDescription>
              Run scrapes manually or wait for the scheduled interval. Scroll to see all tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList tasks={tasks} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

