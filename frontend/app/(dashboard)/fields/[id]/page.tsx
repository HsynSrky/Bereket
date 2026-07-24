"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useMemo } from "react";
import FieldMapLoader from "@/components/fields/FieldMapLoader";
import {
  deleteField,
  formatArea,
  getField,
  updateField,
  type Field,
} from "@/lib/api/fields";

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

const YIELD_RATES_PER_HA: Record<string, number> = {
  "Buğday": 3.5,
  "Arpa": 3.0,
  "Mısır": 9.0,
  "Ayçiçeği": 2.5,
  "Pamuk": 4.5,
  "Kayısı": 10.0,
  "Zeytin": 3.5,
  "Diğer": 3.0,
};

export default function FieldDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Ensure we get a single string id
  const rawId = params?.id;
  const fieldId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [field, setField] = useState<Field | null>(null);
  const [name, setName] = useState("");
  const [cropType, setCropType] = useState(CROP_OPTIONS[0]);
  const [polygonGeoJson, setPolygonGeoJson] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const predictedYield = useMemo(() => {
    if (!field || !field.areaSqMeters) return 0;
    const rate = YIELD_RATES_PER_HA[cropType] || 3.0;
    const hectares = field.areaSqMeters / 10000;
    return hectares * rate;
  }, [field, cropType]);

  useEffect(() => {
    if (!fieldId) return;

    async function loadField() {
      try {
        const data = await getField(fieldId);
        setField(data);
        setName(data.name);
        setCropType(data.cropType || CROP_OPTIONS[0]);
        setPolygonGeoJson(data.polygonGeoJson);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Bahçe yüklenemedi.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadField();
  }, [fieldId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!polygonGeoJson) {
      setError("Bahçe sınırı boş olamaz.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await updateField(fieldId, {
        name,
        cropType,
        polygonGeoJson,
      });
      setField(updated);
      alert("Değişiklikler başarıyla kaydedildi.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Bahçe güncellenemedi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // Prevent any form submission just in case
    
    setIsDeleting(true);

    try {
      await deleteField(fieldId);
      router.push("/fields");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Bahçe silinemedi.",
      );
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-[28px] border border-border bg-surface p-12">
        <p className="text-sm font-medium text-muted">Bahçe yükleniyor...</p>
      </section>
    );
  }

  if (!field) {
    return (
      <section className="rounded-[28px] border border-red-200 bg-red-50 p-8">
        <p className="text-sm text-red-700">{error || "Bahçe bulunamadı."}</p>
        <Link href="/fields" className="mt-4 inline-block text-sm font-medium text-primary">
          Kayıtlı Bahçelerime dön
        </Link>
      </section>
    );
  }

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-[32px] border border-border shadow-xl">
      {/* Background Full-Screen Map */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <FieldMapLoader
          initialGeoJson={polygonGeoJson}
          center={[field.centerLat, field.centerLng]}
          zoom={15}
          onPolygonChange={setPolygonGeoJson}
        />
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

          {/* Stats Bar */}
          <div className="hidden items-center gap-4 rounded-2xl bg-white/80 px-5 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md md:flex">
            <span>Alan: {formatArea(field.areaSqMeters)}</span>
            <span className="text-border">|</span>
            <span>Eklenme: {new Date(field.createdAt).toLocaleDateString("tr-TR")}</span>
          </div>
        </div>

        {/* Bottom Panel Wrapper */}
        <div className="pointer-events-none flex w-full flex-col md:flex-row items-end justify-end gap-6 mt-auto">
          
          {/* Yield Prediction Card */}
          <div className="pointer-events-auto flex w-full max-w-sm flex-col rounded-[28px] border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:mb-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Yapay Zeka Rekolte Tahmini</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                🌾
              </div>
              <div>
                <p className="text-3xl font-black text-foreground">
                  {predictedYield.toFixed(1)} <span className="text-lg text-muted font-bold">Ton</span>
                </p>
                <p className="text-xs font-medium text-emerald-600 mt-1">İdeal koşullarda beklenen hasat</p>
              </div>
            </div>
          </div>

          {/* Bottom Form Card */}
          <div className="pointer-events-auto flex w-full max-w-md flex-col gap-4 rounded-[28px] border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{field.name}</h2>
            <p className="mt-1 text-sm text-muted">
              Haritadan sınırları güncelleyebilir veya detayları değiştirebilirsiniz.
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

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex w-1/3 items-center justify-center rounded-xl border border-red-200 bg-red-50/90 px-4 py-3.5 text-sm font-bold text-red-700 shadow-md backdrop-blur-sm transition hover:bg-red-100 disabled:opacity-70 cursor-pointer"
              >
                {isDeleting ? "Siliniyor..." : "Sil"}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-primary-strong disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? "Kaydediliyor..." : "Güncelle"}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
