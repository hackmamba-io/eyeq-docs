import Link from "next/link";

// Abstract SVG Components for Cards
function GetStartedIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <rect
        x="20"
        y="25"
        width="20"
        height="18"
        rx="2"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="20"
        y="20"
        width="20"
        height="18"
        rx="2"
        fill="currentColor"
        opacity="0.5"
      />
      <circle cx="55" cy="47" r="5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function DeveloperToolsIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <circle cx="40" cy="40" r="10" fill="currentColor" opacity="0.4" />
      <circle cx="18" cy="20" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="62" cy="20" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="18" cy="60" r="4" fill="currentColor" opacity="0.4" />
      <circle cx="62" cy="60" r="4" fill="currentColor" opacity="0.4" />
      <line
        x1="18"
        y1="20"
        x2="40"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <line
        x1="62"
        y1="20"
        x2="40"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <line
        x1="18"
        y1="60"
        x2="40"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <line
        x1="62"
        y1="60"
        x2="40"
        y2="40"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
    </svg>
  );
}

function DocumentationIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <rect
        x="20"
        y="27"
        width="35"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="20"
        y="39"
        width="35"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="20"
        y="51"
        width="25"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="52" cy="29.5" r="3.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function APIReferenceIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <rect
        x="22"
        y="28"
        width="14"
        height="14"
        rx="2"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="22"
        y="23"
        width="14"
        height="14"
        rx="2"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="44"
        y="43"
        width="14"
        height="14"
        rx="2"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

function SDKReferenceIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <rect
        x="20"
        y="27"
        width="35"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="20"
        y="39"
        width="32"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
      <rect
        x="20"
        y="51"
        width="22"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

function KnowledgeBaseIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground/60"
    >
      <path
        d="M40 18 L28 30 L28 58 Q28 63 33 63 L47 63 Q52 63 52 58 L52 30 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="40" cy="42" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="40" cy="51" r="2.5" fill="currentColor" opacity="0.4" />
      <path
        d="M36 58 L40 62 L44 58"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section Container - Keep wider */}
      <div className="mx-auto w-full max-w-6xl px-4 my-15 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        {/* Hero Section with Dark Gradient Background */}
        <div className="relative mb-10 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/70 px-8 py-10 text-center dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 md:px-12 md:py-12">
          {/* Subtle noise/texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <h1 className="relative mb-4 text-4xl font-bold tracking-tight text-white dark:text-white md:mb-5 md:text-5xl lg:text-6xl">
            Everything you need to build with Hackmamba
          </h1>
          <p className="relative mx-auto max-w-2xl text-base text-white/80 dark:text-white/80 md:text-lg">
            Learn how to connect, build, and scale with Hackmamba. Our docs
            offer clear guides and technical references to help you get more
            from our unified documentation infrastructure.
          </p>
        </div>
      </div>

      {/* Content Grid Container - Narrower */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid - 3x2 Layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
          {/* Get Started Card */}
          <Link
            href="/docs/getting-started/configuration"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <GetStartedIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Your first stop - everything you need to start building with
              Hackmamba.
            </p>
          </Link>

          {/* Developer Tools Card */}
          <Link
            href="/docs/developer-tools/sdks"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <DeveloperToolsIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Developer Tools</h3>
            <p className="text-sm text-muted-foreground">
              Plug into your favorite tools and start building powerful
              integrations.
            </p>
          </Link>

          {/* Documentation Card */}
          <Link
            href="/docs/overview"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <DocumentationIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Documentation</h3>
            <p className="text-sm text-muted-foreground">
              See what&apos;s new, what&apos;s better, and what&apos;s coming
              next.
            </p>
          </Link>

          {/* API Reference Card */}
          <Link
            href="/docs/api-reference/api-overview"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <APIReferenceIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">API Reference</h3>
            <p className="text-sm text-muted-foreground">
              All the endpoints and payloads you need to build with Hackmamba.
            </p>
          </Link>

          {/* SDK Reference Card */}
          <Link
            href="/docs/developer-tools/sdks"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <SDKReferenceIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">SDK Reference</h3>
            <p className="text-sm text-muted-foreground">
              Add our SDKs and bring your integration to life with just a few
              lines of code.
            </p>
          </Link>

          {/* Knowledge Base Card */}
          <Link
            href="/docs/community-support/support"
            className="group rounded-lg border border-border/50 bg-slate-50/50 p-5 transition-all hover:border-border hover:bg-slate-100/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/70 md:p-6"
          >
            <div className="mb-3 flex h-20 items-center justify-center md:mb-4">
              <KnowledgeBaseIcon />
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">
              Got questions? Find answers, practical tips, and how-tos.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
