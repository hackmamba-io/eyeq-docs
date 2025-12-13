import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations for EyeQ Developer Documentation
 */
export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/eyeq",
    nav: {
      title: (
        <>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
          <span className="font-semibold">EyeQ Docs</span>
        </>
      ),
    },
    links: [],
  };
}
