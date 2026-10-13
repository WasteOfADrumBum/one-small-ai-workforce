import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Badge, ThemeToggle } from "@onesmall/ui";
import { Providers } from "@/components/providers";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { AuthPanel } from "@/components/auth-panel";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "One Small AI Workforce",
  description: "Deterministic orchestration control plane for AI software operations.",
};

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/agents", label: "Agents" },
  { href: "/workflows", label: "Workflows" },
  { href: "/projects", label: "Projects" },
  { href: "/approvals", label: "Approvals" },
  { href: "/observability", label: "Observability" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="osaw-shell">
            <header className="osaw-nav">
              <div>
                <h1 style={{ margin: 0 }}>One Small AI Workforce</h1>
                <Badge color="info" variant="soft" style={{ marginTop: 4 }}>
                  Phase 1 deterministic demo mode
                </Badge>
              </div>
              <nav className="osaw-nav-links" aria-label="Primary">
                {navigation.map((item) => (
                  <a key={item.href} href={item.href} className="os-btn os-btn-ghost os-btn-sm">
                    {item.label}
                  </a>
                ))}
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ThemeToggle />
                <AuthPanel
                  compact
                  isAuthenticated={Boolean(session)}
                  usernameHint={env.DEMO_AUTH_USERNAME}
                />
              </div>
            </header>
            <main className="osaw-main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
