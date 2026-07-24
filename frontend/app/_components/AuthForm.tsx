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
        title: "Hesap oluşturun",
        description: "Bereket platformuna erişmek için bilgilerinizi girin.",
        submitLabel: "Hesap Oluştur",
        alternateText: "Zaten hesabınız var mı?",
        alternateHref: "/login",
        alternateLabel: "Giriş yapın",
      };
    }
    return {
      title: "Giriş yapın",
      description: "E-posta ve şifrenizle hesabınıza erişin.",
      submitLabel: "Giriş Yap",
      alternateText: "Hesabınız yok mu?",
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
    <div className="card" style={{ maxWidth: '24rem', width: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <img src="/bereket-logo.png" alt="Bereket" style={{ height: '24px' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>Bereket</span>
      </div>

      <h1 style={{ fontSize: '1.375rem', fontWeight: 650, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
        {content.title}
      </h1>
      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
        {content.description}
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground-secondary)', marginBottom: '0.375rem' }}>
            E-posta
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siz@ornek.com"
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground-secondary)', marginBottom: '0.375rem' }}>
            Şifre
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{
            padding: '0.625rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            border: '1px solid var(--danger-border)',
          }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
          {isSubmitting ? "İşleniyor..." : content.submitLabel}
        </button>
      </form>

      <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        {content.alternateText}{" "}
        <Link href={content.alternateHref} style={{ color: 'var(--primary)', fontWeight: 500 }}>
          {content.alternateLabel}
        </Link>
      </p>
    </div>
  );
}
