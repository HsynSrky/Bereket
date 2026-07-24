import Link from "next/link";
import AuthForm from "@/app/_components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mesh bg-orbs px-6 py-16" style={{ background: 'var(--background)' }}>
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] relative z-10">
        {/* Left panel */}
        <section className="hidden card-3d lg:flex lg:flex-col lg:justify-between" style={{
          background: 'linear-gradient(145deg, rgba(20, 55, 35, 0.9) 0%, rgba(10, 25, 18, 0.8) 100%)',
        }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--primary)', opacity: 0.8 }}>
              Bereket
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
              Tarım operasyonları için{" "}
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>tek merkezli</span>{" "}
              dijital çalışma alanı.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7" style={{ color: 'var(--muted)' }}>
            <p>✦ Gerçek kullanıcı verisiyle çalışan güvenilir yönetim paneli.</p>
            <p>✦ 7/24 yapay zeka destekli tarımsal danışmanlık.</p>
            <p>✦ Haritada tarla çizim, hava, finans ve depo yönetimi.</p>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex items-center justify-center">
          <div className="w-full">
            <AuthForm mode="login" />
            <Link href="/" className="mt-5 inline-block text-sm font-medium" style={{ color: 'var(--muted)' }}>
              ← Ana sayfaya dön
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
