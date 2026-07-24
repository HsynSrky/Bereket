import Link from "next/link";
import AuthForm from "@/app/_components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[32px] border border-border bg-[#294d30] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              Bereket
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              Tarım operasyonları için tek merkezli dijital çalışma alanı.
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-white/80">
            <p>Gerçek kullanıcı verisiyle çalışan sade ve güvenilir yönetim paneli.</p>
            <p>Bir sonraki adımda tarla yönetimi, hava durumu ve bildirim modülleri bağlanacak.</p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full">
            <AuthForm mode="login" />
            <Link href="/" className="mt-5 inline-block text-sm font-medium text-muted">
              Ana sayfaya dön
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
