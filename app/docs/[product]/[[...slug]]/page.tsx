import { getSourceByProduct, products } from '@/lib/source';
import { notFound } from 'next/navigation';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { FC } from 'react';
import type { MDXProps } from 'mdx/types';

interface PageProps {
  params: Promise<{
    product: string;
    slug?: string[];
  }>;
}

// Extended page data type that includes body
interface PageData {
  title: string;
  description?: string;
  toc: any;
  body: FC<MDXProps>;
}

export default async function Page({ params }: PageProps) {
  const { product, slug } = await params;
  const source = getSourceByProduct(product);
  
  if (!source) {
    notFound();
  }

  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  // Cast page.data to our PageData type that includes body
  const pageData = page.data as unknown as PageData;
  const MDX = pageData.body;

  return (
    <DocsPage toc={pageData.toc}>
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  const params: { product: string; slug?: string[] }[] = [];
  
  for (const product of products) {
    const source = getSourceByProduct(product.slug);
    if (source) {
      // Add index page
      params.push({ product: product.slug, slug: [] });
      
      // Add all pages
      const pages = source.getPages();
      for (const page of pages) {
        params.push({
          product: product.slug,
          slug: page.slugs,
        });
      }
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { product, slug } = await params;
  const source = getSourceByProduct(product);
  
  if (!source) return {};
  
  const page = source.getPage(slug);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
