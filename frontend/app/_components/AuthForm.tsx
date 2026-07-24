"use client";

import { useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postAuth } from "@/lib/api/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = useMemo(() => {
    if (mode === "register") {
      return {
        title: "Yeni hesap oluştur",
        description:
          "Bereket platformuna erişmek için e-posta adresinizle hesap oluşturun.",
        submitLabel: "Hesap Oluştur",
        alternateText: "Zaten hesabınız var mı?",
        alternateHref: "/login",
        alternateLabel: "Giriş yapın",
      };
    }

    return {
      title: "Hesabınıza giriş yapın",
      description:
        "Tarla, hava ve danışmanlık modüllerini yönetmek için hesabınıza giriş yapın.",
      submitLabel: "Giriş Yap",
      alternateText: "Henüz hesabınız yok mu?",
      alternateHref: "/register",
      alternateLabel: "Kayıt olun",
    };
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await postAuth(mode, { email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Beklenmeyen bir hata oluştu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md card-3d animate-fade-in-up">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <img src="/bereket-logo.png" alt="Bereket" className="h-8 w-auto" />
        <p className="text-sm font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--primary)' }}>Bereket</p>
      </div>

      <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
        {content.title}
      </h1>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>{content.description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--foreground-dim)' }}
          >
            E-posta
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            placeholder="ornek@bereket.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--foreground-dim)' }}
          >
            Şifre
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isSubmitting ? "İşleniyor..." : content.submitLabel}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: 'var(--muted)' }}>
        {content.alternateText}{" "}
        <Link href={content.alternateHref} className="font-semibold transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
          {content.alternateLabel}
        </Link>
      </p>
    </div>
  );
}
