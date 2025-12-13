import { 
  pfcSdkSource, 
  videoSdkSource, 
  videoCliSource, 
  webApiSource, 
  browserSdkSource,
  getSourceByProduct 
} from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';

export const revalidate = false;

// Helper to get page from slug
function getPageFromSlug(slug: string[]) {
  if (!slug || slug.length === 0) return null;
  
  // First segment should be the product
  const productSlug = slug[0];
  const source = getSourceByProduct(productSlug);
  
  if (!source) return null;
  
  // Get page with remaining slug (excluding the last segment which is the image extension)
  const pageSlug = slug.slice(1, -1);
  return source.getPage(pageSlug);
}

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>,
) {
  const { slug } = await params;
  const page = getPageFromSlug(slug);
  if (!page) notFound();

  return new ImageResponse(
    (
      <DefaultImage
        title={page.data.title}
        description={page.data.description}
        site="EyeQ Documentation"
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  const allSources = [
    { source: pfcSdkSource, prefix: 'pfc-sdk' },
    { source: videoSdkSource, prefix: 'video-sdk' },
    { source: videoCliSource, prefix: 'video-cli' },
    { source: webApiSource, prefix: 'web-api' },
    { source: browserSdkSource, prefix: 'browser-sdk' },
  ];

  const allParams: { slug: string[] }[] = [];
  
  for (const { source, prefix } of allSources) {
    const pages = source.getPages();
    for (const page of pages) {
      // Add .png extension to the slug for OG images
      const slugSegments = page.slugs || [];
      allParams.push({
        slug: [prefix, ...slugSegments, 'og.png'],
      });
    }
  }

  return allParams;
}
