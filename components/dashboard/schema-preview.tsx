import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SchemaPreviewProps {
  schema?: Record<string, unknown> | null;
}

export const SchemaPreview = ({ schema }: SchemaPreviewProps) => (
  <Card>
    <CardHeader>
      <CardTitle>AI schema</CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="max-h-60 overflow-auto rounded-xl bg-white/50 border border-white/30 dark:bg-slate-800/40 dark:border-white/10 p-3 text-xs text-slate-700 dark:text-slate-300 font-mono">
        {JSON.stringify(schema ?? { message: "Schema will appear after AI planning" }, null, 2)}
      </pre>
    </CardContent>
  </Card>
);

