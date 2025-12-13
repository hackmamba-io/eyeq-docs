import Link from 'next/link';
import { products, productCategories } from '@/lib/products';

export default function DocsLandingPage() {
  const imageProducts = products.filter(p => p.category === 'image');
  const videoProducts = products.filter(p => p.category === 'video');
  const cloudProducts = products.filter(p => p.category === 'cloud');

  return (
    <div className="container max-w-6xl py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">EyeQ Developer Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered image and video correction SDKs for every platform
        </p>
      </div>

      {/* Search placeholder */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search all documentation..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Image Processing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">📷</span> Image Processing
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {imageProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Video Processing */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🎬</span> Video Processing
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videoProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Cloud & Web */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">☁️</span> Cloud & Web
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cloudProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <QuickLink href="/docs/pfc-sdk/api-reference" icon="📚" text="API Reference" />
          <QuickLink href="/docs/pfc-sdk/examples" icon="🎯" text="Examples" />
          <QuickLink href="https://eyeq.com/downloads" icon="📦" text="Downloads" external />
          <QuickLink href="https://eyeq.com/support" icon="💬" text="Support" external />
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: typeof products[0] }) {
  const isComingSoon = product.status === 'coming-soon';
  
  return (
    <Link
      href={isComingSoon ? '#' : `/docs/${product.slug}`}
      className={`block p-6 rounded-lg border border-border bg-card transition-all ${
        isComingSoon 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:border-primary/50 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{product.icon}</div>
        {product.status === 'beta' && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
            Beta
          </span>
        )}
        {isComingSoon && (
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
      {product.platforms && (
        <div className="flex flex-wrap gap-1">
          {product.platforms.map((platform) => (
            <span
              key={platform}
              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {platform}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function QuickLink({ 
  href, 
  icon, 
  text, 
  external 
}: { 
  href: string; 
  icon: string; 
  text: string; 
  external?: boolean;
}) {
  const Component = external ? 'a' : Link;
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  
  return (
    <Component
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
      {...props}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{text}</span>
      {external && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </Component>
  );
}
