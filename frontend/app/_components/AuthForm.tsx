"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
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
    <div className="w-full max-w-md rounded-[28px] border border-border bg-surface p-8 shadow-sm">
      <div className="flex items-center gap-2">
        <img src="/bereket-logo.png" alt="Bereket" className="h-8 w-auto" />
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">Bereket</p>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">{content.description}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted"
            placeholder="ornek@firma.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted"
            placeholder="En az 8 karakter"
            minLength={8}
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "İşleniyor..." : content.submitLabel}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {content.alternateText}{" "}
        <Link href={content.alternateHref} className="font-semibold text-primary">
          {content.alternateLabel}
        </Link>
      </p>
    </div>
  );
}
