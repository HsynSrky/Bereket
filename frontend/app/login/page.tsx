import AuthForm from "@/app/_components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      padding: '2rem',
    }}>
      <div>
        <AuthForm mode="login" />
        <Link href="/" style={{
          display: 'block',
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--muted)',
        }}>
          ← Ana sayfa
        </Link>
      </div>
    </main>
  );
}
