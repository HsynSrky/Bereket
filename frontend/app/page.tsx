import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '80rem',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/bereket-logo.png" alt="Bereket" style={{ height: '26px', width: 'auto' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 650, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            Bereket
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
            Giriş Yap
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
          v2.0 — Yeni nesil tarım yönetimi
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: 'var(--foreground)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: '48rem',
          margin: '0 auto',
        }}>
          Tarım operasyonlarınızı
          <br />
          <span style={{ color: 'var(--primary)' }}>tek platformda</span> yönetin.
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '36rem',
          margin: '1.25rem auto 0',
          lineHeight: 1.6,
        }}>
          Tarlalarınızı haritada çizin, hava durumunu izleyin,
          AI danışmanından öneriler alın — tamamı gerçek zamanlı.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}>
            Ücretsiz Başla →
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}>
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '0 2rem 5rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          {[
            { icon: "⬡", title: "Tarla Yönetimi", desc: "Haritada poligon çizerek tarla kaydedin. Alan ve ürün türü takibi." },
            { icon: "◉", title: "Hava Durumu", desc: "Tarlaya özel 7 günlük tahmin, toprak nemi ve UV indeksi." },
            { icon: "◎", title: "AI Danışman", desc: "GDD, ROI, zararlı uyanış ve sulama tavsiyesi algoritmaları." },
            { icon: "▣", title: "Finans Yönetimi", desc: "Gelir/gider takibi ve tarla bazlı maliyet analizi." },
            { icon: "⊞", title: "Envanter", desc: "Gübre, ilaç, tohum stok kontrolü ve azalan stok uyarıları." },
            { icon: "☐", title: "Görev Planlama", desc: "Sulama, gübreleme, hasat operasyonlarını tarihle planlayın." },
          ].map((feat) => (
            <div key={feat.title} style={{
              background: 'var(--surface)',
              padding: '2rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                color: 'var(--primary)',
                marginBottom: '1rem',
                border: '1px solid var(--primary-100)',
              }}>
                {feat.icon}
              </div>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '0.375rem',
              }}>
                {feat.title}
              </h3>
              <p style={{
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
              }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
          © 2026 Bereket — Akıllı Tarım Platformu
        </p>
      </footer>
    </main>
  );
}
