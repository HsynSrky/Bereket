import Link from "next/link";
import AuthForm from "@/app/_components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mesh bg-orbs px-6 py-16" style={{ background: 'var(--background)' }}>
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] relative z-10">
        {/* Left panel */}
        <section className="hidden card-3d lg:flex lg:flex-col lg:justify-between" style={{
          background: 'linear-gradient(145deg, rgba(15, 40, 28, 0.9) 0%, rgba(10, 20, 15, 0.8) 100%)',
        }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--primary)', opacity: 0.8 }}>
              Bereket
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
              Tarla ve operasyon verilerinizi{" "}
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>dijital ortamda</span>{" "}
              toplamaya başlayın.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7" style={{ color: 'var(--muted)' }}>
            <p>✦ Ücretsiz kayıt ile tüm özelliklere erişim.</p>
            <p>✦ GDD, ROI ve zararlı uyanış algoritmaları ile fark yaratın.</p>
            <p>✦ Akıllı stok uyarıları ve operasyon planlama.</p>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex items-center justify-center">
          <div className="w-full">
            <AuthForm mode="register" />
            <Link href="/" className="mt-5 inline-block text-sm font-medium" style={{ color: 'var(--muted)' }}>
              ← Ana sayfaya dön
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
