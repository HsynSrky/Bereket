"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getStoredUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Genel Bakış", icon: "◈" },
  { href: "/fields", label: "Bahçeler", icon: "⬡" },
  { href: "/weather", label: "Hava Durumu", icon: "◉" },
  { href: "/advisor", label: "AI Danışman", icon: "◎" },
  { href: "/finances", label: "Finans", icon: "▣" },
  { href: "/tasks", label: "Görevler", icon: "☐" },
  { href: "/inventory", label: "Envanter", icon: "⊞" },
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
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          height: '52px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img src="/bereket-logo.png" alt="Bereket" style={{ height: '28px', width: 'auto' }} />
            <span style={{
              fontSize: '0.9375rem',
              fontWeight: 650,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}>
              Bereket
            </span>
            <span style={{
              fontSize: '0.6875rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '4px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontWeight: 500,
            }}>
              Pro
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
              {user?.email}
            </span>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost"
              style={{ fontSize: '0.8125rem' }}
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '0',
        minHeight: 'calc(100vh - 52px)',
      }}>
        {/* SIDEBAR */}
        <aside style={{
          borderRight: '1px solid var(--border)',
          padding: '1.25rem 0.75rem',
          background: 'var(--surface)',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/fields" && pathname.startsWith("/fields"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main style={{ padding: '1.5rem 2rem', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
