/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { format, instructionId } = await request.json();

  // Check if Telegram is configured
  const settings = await db.getSettings(session.user.id).catch(() => null);
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { message: "Telegram bot not configured. Please add TELEGRAM_BOT_TOKEN to your environment variables." },
      { status: 400 }
    );
  }

  if (!settings?.telegram_chat_id) {
    return NextResponse.json(
      { message: "Please configure your Telegram Chat ID in Settings first." },
      { status: 400 }
    );
  }

  try {
    // Fetch results
    let results = await db.getResults(session.user.id).catch(() => []);

    // Filter by instruction if specified
    if (instructionId) {
      results = results.filter((r: any) => 
        r.instruction?.id === instructionId
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        { message: "No results to export" },
        { status: 400 }
      );
    }

    // Flatten results for export
    const exportData = results.map((r: any) => ({
      title: r.title,
      description: r.description || "",
      url: r.url,
      site: r.instruction?.site?.[0]?.title || r.instruction?.site?.[0]?.url || "Unknown",
      created_at: new Date(r.created_at).toLocaleString(),
      ai_summary: r.ai_summary || "",
      ...r.metadata,
    }));

    // Generate file based on format
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    switch (format) {
      case "csv":
        const csv = Papa.unparse(exportData);
        fileBuffer = Buffer.from(csv, "utf-8");
        fileName = `scraped-data-${Date.now()}.csv`;
        mimeType = "text/csv";
        break;

      case "json":
        const json = JSON.stringify(exportData, null, 2);
        fileBuffer = Buffer.from(json, "utf-8");
        fileName = `scraped-data-${Date.now()}.json`;
        mimeType = "application/json";
        break;

      case "pdf":
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text("Scraped Data Export", 14, 22);
        
        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Results: ${exportData.length}`, 14, 35);
        
        // Table
        const tableData = exportData.slice(0, 100).map((item) => [
          item.title?.substring(0, 40) || "",
          item.site?.substring(0, 20) || "",
          item.created_at || "",
        ]);
        
        autoTable(doc, {
          startY: 42,
          head: [["Title", "Site", "Date"]],
          body: tableData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [14, 165, 233] },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          margin: { top: 42 },
        });
        
        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
        
        fileBuffer = Buffer.from(doc.output("arraybuffer"));
        fileName = `scraped-data-${Date.now()}.pdf`;
        mimeType = "application/pdf";
        break;

      default:
        return NextResponse.json({ message: "Invalid format" }, { status: 400 });
    }

    // Send to Telegram
    const formData = new FormData();
    formData.append("chat_id", settings.telegram_chat_id);
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    formData.append("document", new Blob([uint8Array], { type: mimeType }), fileName);
    
    const caption = `📊 *Exported Data Report*\n\n` +
      `Format: ${format.toUpperCase()}\n` +
      `Results: ${exportData.length} items\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `_From your AI Monitor dashboard_`;
    
    formData.append("caption", caption);
    formData.append("parse_mode", "Markdown");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error("Telegram API error:", telegramData);
      throw new Error(telegramData.description || "Failed to send file to Telegram");
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${format.toUpperCase()} file to Telegram!`,
      fileName,
      resultCount: exportData.length,
    });

  } catch (error) {
    console.error("Telegram export error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to send to Telegram",
        hint: "Make sure your Telegram bot token and chat ID are configured correctly."
      },
      { status: 500 }
    );
  }
}

