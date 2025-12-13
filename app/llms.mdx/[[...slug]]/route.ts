import { getLLMText } from "@/lib/get-llm-text";
import { 
  pfcSdkSource, 
  videoSdkSource, 
  videoCliSource, 
  webApiSource, 
  browserSdkSource,
  getSourceByProduct 
} from "@/lib/source";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = false;

// Helper to get page from any source based on slug
function getPageFromSlug(slug: string[] | undefined) {
  if (!slug || slug.length === 0) return null;
  
  // First segment should be the product
  const productSlug = slug[0];
  const source = getSourceByProduct(productSlug);
  
  if (!source) return null;
  
  // Get page with remaining slug
  const pageSlug = slug.slice(1);
  return source.getPage(pageSlug);
}

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/[[...slug]]">
) {
  const { slug } = await params;
  const page = getPageFromSlug(slug);
  if (!page) notFound();

  // Cast to the type expected by getLLMText
  const llmPage = {
    url: page.url,
    data: {
      title: page.data.title,
      getText: (page.data as any).getText,
    }
  };

  return new Response(await getLLMText(llmPage), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

// Generate static params - exclude from static export to avoid conflicts
export function generateStaticParams() {
  // Return empty array for static export to exclude this route
  if (process.env.EXPORT_STATIC === "true") {
    return [{ slug: [] }];
  }
  
  // Combine params from all sources
  const allSources = [
    { source: pfcSdkSource, prefix: 'pfc-sdk' },
    { source: videoSdkSource, prefix: 'video-sdk' },
    { source: videoCliSource, prefix: 'video-cli' },
    { source: webApiSource, prefix: 'web-api' },
    { source: browserSdkSource, prefix: 'browser-sdk' },
  ];

  const allParams: { slug: string[] }[] = [];
  
  for (const { source, prefix } of allSources) {
    const params = source.generateParams();
    for (const param of params) {
      allParams.push({
        slug: [prefix, ...(param.slug || [])],
      });
    }
  }

  return allParams;
}
