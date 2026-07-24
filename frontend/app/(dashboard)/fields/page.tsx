"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatArea, getFields, deleteField, type Field } from "@/lib/api/fields";
import { useRouter } from "next/navigation";

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadFields() {
    try {
      setLoading(true);
      const data = await getFields();
      setFields(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Bahçeler yüklenemedi.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFields();
  }, []);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteField(id);
      // Remove from state
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Silme işlemi başarısız oldu."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-[28px] border border-border bg-surface p-12">
        <p className="text-sm font-medium text-muted">Bahçeleriniz yükleniyor...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Bahçe Yönetimi
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Kayıtlı Bahçelerim</h1>
          <p className="mt-2 text-sm text-muted">
            Haritada çizdiğiniz ve kaydettiğiniz tüm bahçeler burada listelenir.
          </p>
        </div>
        <Link
          href="/fields/new"
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-strong shadow-md shadow-primary/20"
        >
          Yeni Bahçe Ekle
        </Link>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </section>
      ) : null}

      {fields.length === 0 ? (
        <section className="rounded-[28px] border-2 border-dashed border-border bg-surface p-16 text-center shadow-sm">
          <p className="text-xl font-semibold text-foreground">
            Henüz kayıtlı bahçeniz yok
          </p>
          <p className="mt-3 max-w-md mx-auto text-sm text-muted">
            İlk bahçenizi haritada çizerek ekleyebilirsiniz. Arazi sınırlarınızı belirleyin ve yönetmeye başlayın.
          </p>
          <Link
            href="/fields/new"
            className="mt-8 inline-flex rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-strong shadow-md shadow-primary/20"
          >
            Haritada Çiz
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-border bg-surface p-6 shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {field.cropType || "Belirtilmedi"}
                  </span>
                  <span className="text-xs font-medium text-muted">
                    {new Date(field.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{field.name}</h3>
                <p className="text-sm text-muted mb-4">
                  Büyüklük: <span className="font-medium text-foreground">{formatArea(field.areaSqMeters)}</span>
                </p>
              </div>
              
              <div className="mt-4 flex gap-3 pt-4 border-t border-border/50">
                <Link
                  href={`/fields/${field.id}`}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-surface-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-border/60"
                >
                  Görüntüle
                </Link>
                <button
                  onClick={() => handleDelete(field.id)}
                  disabled={deletingId === field.id}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === field.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
