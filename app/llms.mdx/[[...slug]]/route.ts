import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/[[...slug]]">
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

// Generate static params - exclude from static export to avoid conflicts
export function generateStaticParams() {
  // Return empty array for static export to exclude this route
  // This route is primarily for LLM consumption and not needed for offline viewing
  if (process.env.EXPORT_STATIC === "true") {
    return [{ slug: [] }]; // Return one empty param to satisfy Next.js requirement
  }
  return source.generateParams();
}
