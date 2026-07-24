import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/bereket-logo.png" alt="Bereket" className="h-12 w-auto" />
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary">
                Bereket
              </p>
            </div>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Tarım operasyonlarını tek ekranda, sade ve profesyonel biçimde yönetin.
            </h1>
          </div>
          <div className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted lg:block">
            MVP web paneli
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
            <p className="max-w-2xl text-base leading-7 text-muted md:text-lg">
              Tarlalarınızı yönetin, konuma bağlı hava durumunu izleyin ve yapay zeka destekli
              tarım önerilerini tek platformda takip edin. Arayüz, demo hissi vermeyen sade ve
              güven veren bir iş uygulaması deneyimi için tasarlandı.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-border bg-surface-muted p-5">
                <p className="text-sm font-medium text-secondary">Tarla Yönetimi</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Gerçek kullanıcı verisiyle çalışan parsel kayıt ve takip altyapısı.
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-surface-muted p-5">
                <p className="text-sm font-medium text-secondary">Hava Entegrasyonu</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Seçilen tarla için güncel ve tahmine dayalı hava görünümü.
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-surface-muted p-5">
                <p className="text-sm font-medium text-secondary">AI Destekli Yardım</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Operasyon kararlarını destekleyen üretim odaklı danışmanlık akışı.
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Başlangıç
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Web uygulamasına giriş yapın
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              İlk aşamada kullanıcı kayıt ve giriş akışını gerçek backend servisleriyle
              çalıştırıyoruz. Sonraki adımda tarla ve hava modülleri eklenecek.
            </p>

            <div className="mt-8 grid gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
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
