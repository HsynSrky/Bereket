"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getStoredUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Panel" },
  { href: "/fields", label: "Kayıtlı Bahçelerim" },
  { href: "/weather", label: "Hava" },
  { href: "/advisor", label: "Danışman" },
  { href: "/finances", label: "Maliyet" },
  { href: "/tasks", label: "Görevler" },
  { href: "/inventory", label: "Depo" },
];

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/bereket-logo.png" alt="Bereket" className="h-10 w-auto" />
            <div>
              <p className="text-sm font-bold tracking-wide text-foreground">
                Bereket
              </p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr] lg:px-10">
        <aside className="h-fit rounded-2xl border border-border bg-surface p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/fields" && pathname.startsWith("/fields"));

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
