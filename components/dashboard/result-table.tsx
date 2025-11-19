"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Result {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  metadata?: Record<string, unknown> | null;
  ai_summary?: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export const ResultTable = ({ results, showHeader = true }: { results: Result[]; showHeader?: boolean }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter results based on search
  const filteredResults = results.filter((result) =>
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      {/* Header with search */}
      {showHeader && (
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scraped Results ({filteredResults.length})</CardTitle>
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg bg-background text-sm w-64"
              />
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Results Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentResults.map((result) => (
          <Card key={result.id} className="border-border/70 hover:border-primary/50 transition-all duration-200 hover:shadow-lg group">
            <CardContent className="p-6">
              {/* Title */}
              <div className="mb-3">
                <Link
                  href={result.url}
                  target="_blank"
                  className="font-semibold text-lg text-primary hover:underline flex items-start gap-2 group-hover:text-primary/80"
                >
                  <span className="flex-1 line-clamp-2">{result.title}</span>
                  <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Description */}
              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {result.description}
                </p>
              )}

              {/* Metadata Tags */}
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(result.metadata)
                    .filter(([key]) => !key.includes('container') && !key.includes('link'))
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {String(value).substring(0, 20)}
                      </Badge>
                    ))}
                </div>
              )}

              {/* AI Summary */}
              {result.ai_summary && result.ai_summary !== "Awaiting AI summary" && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    💡 {result.ai_summary}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <span>{formatDate(result.created_at)}</span>
                <Badge variant="outline" className="text-xs">
                  {result.ai_summary && result.ai_summary !== "Awaiting AI summary" ? "✓ AI" : "⏳ Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredResults.length === 0 && (
        <Card className="border-border/70">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No results match your search." : "No data yet. Trigger a manual scrape from the dashboard."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} of {filteredResults.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
