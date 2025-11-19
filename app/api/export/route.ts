/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/supabase/queries";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const instructionId = searchParams.get("instructionId");

  try {
    // Fetch results
    let results = await db.getResults(session.user.id).catch(() => []);

    // Filter by instruction if specified
    if (instructionId) {
      results = results.filter((r: any) => 
        r.instruction?.id === instructionId
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

    // Export based on format
    switch (format) {
      case "csv":
        return exportCSV(exportData);
      case "json":
        return exportJSON(exportData);
      case "pdf":
        return exportPDF(exportData);
      default:
        return NextResponse.json({ message: "Invalid format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { message: "Failed to export data" },
      { status: 500 }
    );
  }
}

function exportCSV(data: any[]) {
  const csv = Papa.unparse(data);
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="scraped-data-${Date.now()}.csv"`,
    },
  });
}

function exportJSON(data: any[]) {
  const json = JSON.stringify(data, null, 2);
  
  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="scraped-data-${Date.now()}.json"`,
    },
  });
}

function exportPDF(data: any[]) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text("Scraped Data Export", 14, 22);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Results: ${data.length}`, 14, 35);
  
  // Table
  const tableData = data.slice(0, 100).map((item) => [
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
  
  const pdfBuffer = doc.output("arraybuffer");
  
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="scraped-data-${Date.now()}.pdf"`,
    },
  });
}

