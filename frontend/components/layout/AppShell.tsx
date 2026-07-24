"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getStoredUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: "📊" },
  { href: "/fields", label: "Bahçelerim", icon: "🌾" },
  { href: "/weather", label: "Hava", icon: "🌤️" },
  { href: "/advisor", label: "Danışman", icon: "🧠" },
  { href: "/finances", label: "Maliyet", icon: "💰" },
  { href: "/tasks", label: "Görevler", icon: "📋" },
  { href: "/inventory", label: "Depo", icon: "📦" },
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
    <div className="min-h-screen bg-mesh bg-orbs" style={{ background: 'var(--background)' }}>
      {/* === HEADER === */}
      <header className="glass-strong sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/bereket-logo.png" alt="Bereket" className="h-10 w-auto relative z-10" />
              <div className="absolute inset-0 blur-lg opacity-40" style={{ background: 'var(--primary-glow)' }} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-glow" style={{ color: 'var(--primary)' }}>
                Bereket
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* === LAYOUT === */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_1fr] lg:px-10">
        {/* === SIDEBAR === */}
        <aside
          className="glass-card h-fit rounded-2xl p-4 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <nav className="space-y-1 stagger-children">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/fields" && pathname.startsWith("/fields"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-pill flex items-center gap-2.5 ${isActive ? "active" : ""}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mini stats in sidebar */}
          <div className="mt-6 rounded-xl p-3" style={{ background: 'rgba(52, 211, 153, 0.06)', border: '1px solid rgba(52, 211, 153, 0.1)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>Sistem Durumu</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--success)' }}></span>
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Tüm sistemler aktif</span>
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="animate-fade-in-up min-w-0" style={{ animationDelay: '0.2s' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
