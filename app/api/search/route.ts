import { 
  pfcSdkSource, 
  videoSdkSource, 
  videoCliSource, 
  webApiSource, 
  browserSdkSource 
} from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { NextResponse } from "next/server";

// Enable static export compatibility
export const dynamic = "force-static";
export const revalidate = false;

// For static export, we can't use search
// For multi-docs, we'd need to combine all sources or handle per-product search

// Export GET handler
export async function GET(request: Request) {
  // For static export, return a placeholder response
  if (process.env.EXPORT_STATIC === "true") {
    return NextResponse.json({
      message: "Search is not available in static export mode",
    });
  }

  // For now, return a message indicating search needs to be configured for multi-docs
  return NextResponse.json({
    message: "Search API - use product-specific search or configure unified search",
  });
}
