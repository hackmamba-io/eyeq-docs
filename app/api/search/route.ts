import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { NextResponse } from "next/server";

// Enable static export compatibility
export const dynamic = "force-static";
export const revalidate = false;

// Create the search handler for non-static builds
const searchHandler =
  process.env.EXPORT_STATIC === "true"
    ? null
    : createFromSource(source, {
        language: "english",
      });

// Export GET handler
export async function GET(request: Request) {
  // For static export, return a placeholder response
  if (process.env.EXPORT_STATIC === "true" || !searchHandler) {
    return NextResponse.json({
      message: "Search is not available in static export mode",
    });
  }

  // Normal server-side search
  return searchHandler.GET(request);
}
