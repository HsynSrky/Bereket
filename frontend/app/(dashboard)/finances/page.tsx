"use client";

import { useEffect, useState, useMemo } from "react";
import { getFields, type Field } from "@/lib/api/fields";
import { getTransactions, createTransaction, deleteTransaction, type Transaction } from "@/lib/api/finances";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const EXPENSE_CATEGORIES = ["Gübre", "Tohum", "Mazot", "İlaç", "İşçilik", "Diğer"];
const INCOME_CATEGORIES = ["Hasat Satışı", "Destekleme", "Diğer"];
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState("Gider");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [txs, flds] = await Promise.all([getTransactions(), getFields()]);
        setTransactions(txs);
        setFields(flds);
      } catch (err) {
        console.error("Finans verileri alınamadı", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  // Update categories when type changes
  useEffect(() => {
    setCategory(type === "Gider" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setIsSubmitting(true);
    try {
      const newTx = await createTransaction({
        type,
        category,
        amount: Number(amount),
        description,
        date: new Date().toISOString(),
        fieldId: fieldId || null,
      });
      setTransactions([newTx, ...transactions]);
      setAmount("");
      setDescription("");
    } catch (err) {
      alert("İşlem kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(tx => tx.id !== id));
    } catch (err) {
      alert("İşlem silinemedi.");
    }
  };

  // Data processing for charts
  const { totalIncome, totalExpense, expenseData } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const expMap: Record<string, number> = {};

    transactions.forEach(tx => {
      if (tx.type === "Gelir") {
        inc += tx.amount;
      } else {
        exp += tx.amount;
        expMap[tx.category] = (expMap[tx.category] || 0) + tx.amount;
      }
    });

    const expData = Object.keys(expMap).map(key => ({
      name: key,
      value: expMap[key]
    }));

    return { totalIncome: inc, totalExpense: exp, expenseData: expData };
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return <div className="p-12 text-center text-muted">Finans verileri yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Overview */}
      <section className="flex flex-col gap-6 md:flex-row">
        
        {/* Total Balance Card */}
        <div className="flex-1 rounded-[32px] border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-muted tracking-wider">Net Bakiye</h2>
          <p className={`mt-2 text-5xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {balance >= 0 ? '+' : ''}{balance.toLocaleString('tr-TR')} ₺
          </p>
          
          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Toplam Gelir</p>
              <p className="text-xl font-bold text-foreground">{totalIncome.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-muted">Toplam Gider</p>
              <p className="text-xl font-bold text-foreground">{totalExpense.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
        </div>

        {/* Expense Chart */}
        <div className="flex-1 rounded-[32px] border border-border bg-surface p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-sm font-semibold uppercase text-muted tracking-wider self-start mb-4">Gider Dağılımı</h2>
          {expenseData.length > 0 ? (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('tr-TR')} ₺`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted text-sm mt-8">Henüz gider kaydedilmedi.</p>
          )}
        </div>
      </section>

      {/* Main Content: Add New vs List */}
      <section className="grid gap-6 md:grid-cols-3">
        
        {/* Add Transaction Form */}
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm md:col-span-1">
          <h2 className="text-xl font-bold text-foreground mb-6">Yeni İşlem Ekle</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-muted rounded-xl">
              <button
                type="button"
                onClick={() => setType("Gider")}
                className={`py-2 text-sm font-semibold rounded-lg transition ${type === "Gider" ? "bg-white text-red-600 shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Gider
              </button>
              <button
                type="button"
                onClick={() => setType("Gelir")}
                className={`py-2 text-sm font-semibold rounded-lg transition ${type === "Gelir" ? "bg-white text-emerald-600 shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                Gelir
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {(type === "Gider" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Tutar (₺)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Örn: 5000"
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Tarlaya Bağla (Opsiyonel)</label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Genel İşlem</option>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Açıklama</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Üre gübresi alımı"
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary mt-2 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-strong disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "İşlemi Kaydet"}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm md:col-span-2">
          <h2 className="text-xl font-bold text-foreground mb-6">Son İşlemler</h2>
          
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted">
              <span className="text-4xl mb-3">🧾</span>
              <p>Henüz finansal işlem kaydedilmedi.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {transactions.map(tx => {
                const isIncome = tx.type === "Gelir";
                const relatedField = fields.find(f => f.id === tx.fieldId);
                
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface-muted/50 p-4 transition hover:bg-surface-muted group">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {isIncome ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{tx.category}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{new Date(tx.date).toLocaleDateString('tr-TR')}</span>
                          {relatedField && (
                            <>
                              <span>•</span>
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{relatedField.name}</span>
                            </>
                          )}
                          {tx.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{tx.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-black ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isIncome ? '+' : '-'}{tx.amount.toLocaleString('tr-TR')} ₺
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-all"
                        title="İşlemi Sil"
                      >
                        <span>🗑️</span> Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
