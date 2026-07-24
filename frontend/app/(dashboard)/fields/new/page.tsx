"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import FieldMapLoader from "@/components/fields/FieldMapLoader";
import { createField } from "@/lib/api/fields";

const CROP_OPTIONS = [
  "Buğday",
  "Arpa",
  "Mısır",
  "Ayçiçeği",
  "Pamuk",
  "Kayısı",
  "Zeytin",
  "Diğer",
];

export default function NewFieldPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cropType, setCropType] = useState(CROP_OPTIONS[0]);
  const [polygonGeoJson, setPolygonGeoJson] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!polygonGeoJson) {
      setError("Lütfen haritada tarla sınırını çizin.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createField({
        name,
        cropType,
        polygonGeoJson,
      });
      router.push(`/fields`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Bahçe kaydedilemedi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-[32px] border border-border shadow-xl">
      {/* Background Full-Screen Map */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <FieldMapLoader onPolygonChange={setPolygonGeoJson} />
      </div>

      {/* Floating Glassmorphic Panel */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-8">
        
        {/* Top Header */}
        <div className="pointer-events-auto flex items-center justify-between">
          <Link
            href="/fields"
            className="flex items-center gap-2 rounded-2xl bg-white/80 px-5 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            ← Bahçelere Dön
          </Link>
        </div>

        {/* Bottom Form Card */}
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-4 self-end rounded-[28px] border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Yeni Bahçe Ekle</h2>
            <p className="mt-1 text-sm text-muted">
              Haritadan parselinizi çizin ve bilgileri girin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="name">
                Bahçe Adı
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/50 bg-white/60 px-4 py-3 text-sm shadow-inner outline-none focus:border-primary/50 focus:bg-white/90"
                placeholder="Örn: Kuzey parsel"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="cropType">
                Ürün Türü
              </label>
              <select
                id="cropType"
                value={cropType}
                onChange={(event) => setCropType(event.target.value)}
                className="w-full rounded-xl border border-white/50 bg-white/60 px-4 py-3 text-sm shadow-inner outline-none focus:border-primary/50 focus:bg-white/90"
              >
                {CROP_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-primary-strong disabled:opacity-70"
            >
              {isSubmitting ? "Kaydediliyor..." : "Bahçeyi Kaydet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
