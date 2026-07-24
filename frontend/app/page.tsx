import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-mesh bg-orbs" style={{ background: 'var(--background)' }}>
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-10 relative z-10">
        {/* Top bar */}
        <div className="mb-16 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/bereket-logo.png" alt="Bereket" className="h-14 w-auto relative z-10" />
              <div className="absolute inset-0 blur-xl opacity-50" style={{ background: 'var(--primary-glow)' }} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide text-glow" style={{ color: 'var(--primary)' }}>
                Bereket
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Akıllı Tarım Platformu</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 rounded-full px-4 py-2 glass" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--success)' }}></span>
            </span>
            v2.0 — Premium
          </div>
        </div>

        {/* Hero */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl" style={{ color: 'var(--foreground)', lineHeight: 1.1 }}>
            Tarım operasyonlarınızı{" "}
            <span className="text-glow" style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              tek ekranda
            </span>{" "}
            yönetin.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 md:text-lg" style={{ color: 'var(--muted)' }}>
            Tarlalarınızı haritada çizin, hava durumunu izleyin, yapay zeka danışmanından öneriler alın 
            — tamamı gerçek zamanlı, tek platformda.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mt-8">
          {/* Features card */}
          <div className="card-3d animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="grid gap-4 md:grid-cols-3 stagger-children">
              {[
                { icon: "🌾", title: "Tarla Yönetimi", desc: "Haritada poligon çizerek parselleri kaydedin ve takip edin." },
                { icon: "🌤️", title: "Hava Entegrasyonu", desc: "Tarlaya özel 7 günlük tahmin, toprak nemi ve UV verileri." },
                { icon: "🧠", title: "AI Danışman", desc: "RAG mimarisine sahip yapay zeka destekli tarımsal danışmanlık." },
                { icon: "💰", title: "Maliyet Analizi", desc: "Gelir/gider takibi ve otomatik ROI hesaplama." },
                { icon: "📦", title: "Depo Yönetimi", desc: "Gübre, ilaç, tohum stok kontrolü ve akıllı uyarılar." },
                { icon: "📋", title: "Görev Planlama", desc: "Sulama, gübreleme, hasat operasyonlarını planlayın." },
              ].map((feat) => (
                <article key={feat.title} className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'rgba(52, 211, 153, 0.04)',
                  border: '1px solid rgba(52, 211, 153, 0.08)',
                }}>
                  <span className="text-2xl">{feat.icon}</span>
                  <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>{feat.title}</p>
                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>{feat.desc}</p>
                </article>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <aside className="card-3d flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--primary)' }}>
                Başlangıç
              </p>
              <h2 className="mt-3 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Hemen başlayın
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                Ücretsiz hesap oluşturun ve tarım operasyonlarınızı dijital ortama taşıyın. 
                Yapay zeka destekli danışmanınız 7/24 yanınızda.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              <Link
                href="/login"
                className="btn-primary inline-flex items-center justify-center text-center"
              >
                Giriş Yap →
              </Link>
              <Link
                href="/register"
                className="btn-ghost inline-flex items-center justify-center text-center"
              >
                Hesap Oluştur
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
