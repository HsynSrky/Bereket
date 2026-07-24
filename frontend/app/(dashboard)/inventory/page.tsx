"use client";

import { useEffect, useState } from "react";
import { getInventoryItems, createInventoryItem, deleteInventoryItem, type InventoryItem } from "@/lib/api/inventory";

const CATEGORIES = ["Gübre", "İlaç", "Tohum", "Yakıt", "Ekipman Parçası"];
const UNITS = ["Kg", "Litre", "Adet", "Çuval"];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getInventoryItems();
        setItems(data);
      } catch (err) {
        console.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }
    void loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || isNaN(Number(quantity))) return;

    setIsSubmitting(true);
    try {
      const newItem = await createInventoryItem({
        name,
        category,
        quantity: Number(quantity),
        unit,
        description,
      });
      setItems([newItem, ...items]);
      setName("");
      setQuantity("");
      setDescription("");
    } catch (err) {
      alert("Ürün depoya eklenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      alert("Ürün silinemedi.");
    }
  };

  const getStockWarning = (item: InventoryItem) => {
    if (item.quantity <= 0) return { bg: "bg-red-100", text: "text-red-700", label: "Tükendi" };
    if (item.quantity < 10) return { bg: "bg-amber-100", text: "text-amber-700", label: "Azalıyor" };
    return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Yeterli" };
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center rounded-[32px] border border-border bg-surface">
        <p className="text-muted font-medium">Depo sayılıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Depo & Envanter Yönetimi</h1>
        <p className="text-muted">Gübre, tohum ve ilaç stoklarınızı anlık takip edin.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {/* Add Item Form */}
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-foreground">Yeni Ürün Girişi</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Ürün Adı</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: 20-20-20 Gübre"
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Kategori</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Birim</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Miktar</label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-strong disabled:opacity-50"
            >
              {isSubmitting ? "Ekleniyor..." : "Depoya Ekle"}
            </button>
          </form>
        </div>

        {/* Inventory List */}
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Stoktaki Ürünler</h2>
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Toplam {items.length} Kalem
            </span>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/50 py-12 text-center text-muted">
                Deponuz şu an boş.
              </div>
            ) : (
              items.map((item) => {
                const warning = getStockWarning(item);
                return (
                  <div key={item.id} className="group relative flex items-center justify-between rounded-2xl border border-border/50 bg-surface-muted/50 p-4 transition hover:bg-surface-muted">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                        {item.category === "İlaç" ? "🧪" : item.category === "Gübre" ? "🌾" : item.category === "Tohum" ? "🌱" : "📦"}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{item.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-semibold">{item.category}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${warning.bg} ${warning.text}`}>
                            {warning.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-2xl font-black text-foreground">{item.quantity}</span>
                        <span className="ml-1 text-sm font-bold text-muted-foreground uppercase">{item.unit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Ürünü Sil"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
