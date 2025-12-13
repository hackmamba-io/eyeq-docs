import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { getSourceByProduct, products } from "@/lib/source";
import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";
import { ProductSwitcher } from "@/components/product-switcher";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ product: string }>;
}

export default async function ProductLayout({ children, params }: LayoutProps) {
  const { product } = await params;
  const source = getSourceByProduct(product);
  const productInfo = getProductBySlug(product);
  
  if (!source || !productInfo) {
    notFound();
  }

  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      sidebar={{
        defaultOpenLevel: 2,
        collapsible: true,
        banner: (
          <ProductSwitcher 
            currentProduct={product} 
            products={products} 
          />
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}

export function generateStaticParams() {
  return products.map((product) => ({
    product: product.slug,
  }));
}
