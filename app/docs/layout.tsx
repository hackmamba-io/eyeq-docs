import { baseOptions } from "@/lib/layout.shared";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
    </HomeLayout>
  );
}
