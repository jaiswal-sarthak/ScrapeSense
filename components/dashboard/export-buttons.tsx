"use client";

import { useState } from "react";
import { Download, FileText, FileJson, FileSpreadsheet, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  instructionId?: string;
}

export const ExportButtons = ({ instructionId }: ExportButtonsProps) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    setExporting(format);
    
    try {
      const params = new URLSearchParams({ format });
      if (instructionId) {
        params.append("instructionId", instructionId);
      }
      
      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `export-${Date.now()}.${format}`;
      
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleSendToTelegram = async (format: "csv" | "json" | "pdf") => {
    setSending(format);
    
    try {
      const response = await fetch("/api/export/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          instructionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send to Telegram");
      }

      alert(`✅ ${data.message}`);
    } catch (error) {
      console.error("Telegram send error:", error);
      alert(error instanceof Error ? error.message : "Failed to send to Telegram. Please try again.");
    } finally {
      setSending(null);
    }
  };

  const isLoading = !!exporting || !!sending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting 
            ? `Exporting ${exporting.toUpperCase()}...` 
            : sending 
            ? `Sending ${sending.toUpperCase()}...`
            : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* Download Options */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Download
        </div>
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="font-medium">Export as CSV</p>
            <p className="text-xs text-muted-foreground">For Excel/Google Sheets</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-sky-600" />
          <div>
            <p className="font-medium">Export as JSON</p>
            <p className="text-xs text-muted-foreground">For developers/APIs</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium">Export as PDF</p>
            <p className="text-xs text-muted-foreground">For presentations/reports</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Send to Telegram Options */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Send className="h-3 w-3" />
          Send to Telegram
        </div>
        <DropdownMenuItem onClick={() => handleSendToTelegram("csv")} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="font-medium">Send CSV</p>
            <p className="text-xs text-muted-foreground">Instant delivery</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSendToTelegram("json")} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4 text-sky-600" />
          <div>
            <p className="font-medium">Send JSON</p>
            <p className="text-xs text-muted-foreground">Instant delivery</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSendToTelegram("pdf")} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-red-600" />
          <div>
            <p className="font-medium">Send PDF</p>
            <p className="text-xs text-muted-foreground">Instant delivery</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

