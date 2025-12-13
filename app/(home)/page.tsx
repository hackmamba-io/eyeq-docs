import Link from "next/link";

// Product Icons
function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="10 9 16 12 10 15" fill="currentColor" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <circle cx="7" cy="6" r="1" fill="currentColor" />
      <circle cx="11" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <polyline points="7 10 10 13 7 16" />
      <line x1="13" y1="16" x2="17" y2="16" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <div className="mx-auto w-full max-w-6xl px-4 my-15 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <div className="relative mb-10 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/70 px-8 py-10 text-center dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 md:px-12 md:py-12">
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <h1 className="relative mb-4 text-4xl font-bold tracking-tight text-white dark:text-white md:mb-5 md:text-5xl lg:text-6xl">
            EyeQ Developer Documentation
          </h1>
          <p className="relative mx-auto max-w-2xl text-base text-white/80 dark:text-white/80 md:text-lg">
            AI-powered image and video enhancement for any platform. 
            Choose your SDK and start building beautiful experiences.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold">Choose Your Platform</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {/* PFC SDK */}
          <Link
            href="/docs/pfc-sdk"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-blue-500/50 hover:bg-blue-50/30 dark:bg-slate-800/50 dark:hover:bg-blue-900/20 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <ImageIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Perfectly Clear SDK</h3>
            <p className="text-sm text-muted-foreground">
              C/C++, .NET, and desktop SDKs for desktop and server image processing.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-blue-600 dark:text-blue-400">
              Windows • macOS • Linux
            </span>
          </Link>

          {/* Browser SDK */}
          <Link
            href="/docs/browser-sdk"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-orange-500/50 hover:bg-orange-50/30 dark:bg-slate-800/50 dark:hover:bg-orange-900/20 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <BrowserIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Browser SDK</h3>
            <p className="text-sm text-muted-foreground">
              WebAssembly SDK with local AI inference for client-side processing.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-orange-600 dark:text-orange-400">
              JavaScript • TypeScript • WebAssembly
            </span>
          </Link>

          {/* Video SDK */}
          <Link
            href="/docs/video-sdk"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-purple-500/50 hover:bg-purple-50/30 dark:bg-slate-800/50 dark:hover:bg-purple-900/20 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <VideoIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Video SDK</h3>
            <p className="text-sm text-muted-foreground">
              Real-time video frame enhancement for mobile applications.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-purple-600 dark:text-purple-400">
              iOS • Android
            </span>
          </Link>

          {/* Video CLI */}
          <Link
            href="/docs/video-cli"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-gray-500/50 hover:bg-gray-50/30 dark:bg-slate-800/50 dark:hover:bg-gray-700/20 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <TerminalIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Video CLI</h3>
            <p className="text-sm text-muted-foreground">
              Command-line tool for batch video processing and automation.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-gray-600 dark:text-gray-400">
              Windows • macOS • Linux
            </span>
          </Link>

          {/* Web API */}
          <Link
            href="/docs/web-api"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-green-500/50 hover:bg-green-50/30 dark:bg-slate-800/50 dark:hover:bg-green-900/20 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <CloudIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Web API</h3>
            <p className="text-sm text-muted-foreground">
              REST API for cloud-based image enhancement and batch processing.
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-green-600 dark:text-green-400">
              REST • Any Language
            </span>
          </Link>

          {/* All Products */}
          <Link
            href="/docs"
            className="group rounded-lg border border-dashed border-border/50 bg-transparent p-5 transition-all hover:border-border hover:bg-slate-50/50 dark:hover:bg-slate-800/30 md:p-6"
          >
            <div className="mb-3 flex h-16 items-center justify-center md:mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">View All Products</h3>
            <p className="text-sm text-muted-foreground">
              Browse all EyeQ products and find the right solution for your needs.
            </p>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/docs/pfc-sdk/getting-started" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Quick Start Guide →
            </Link>
            <Link href="/docs/pfc-sdk/api-reference" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              API Reference →
            </Link>
            <Link href="https://eyeq.com/support" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              Get Support →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
