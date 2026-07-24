"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFields, type Field } from "@/lib/api/fields";
import { getTasks, type FarmTask } from "@/lib/api/tasks";
import { getTransactions, type Transaction } from "@/lib/api/finances";

export default function DashboardPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [flds, tsks, txs] = await Promise.all([
          getFields(),
          getTasks(),
          getTransactions()
        ]);
        setFields(flds);
        setTasks(tsks);
        setTransactions(txs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  const totalArea = fields.reduce((sum, f) => sum + f.areaSqMeters, 0) / 10000;
  
  const balance = transactions.reduce((sum, tx) => {
    return tx.type === "Gelir" ? sum + tx.amount : sum - tx.amount;
  }, 0);

  const pendingTasks = tasks.filter(t => t.status === "Bekliyor").length;
  
  // Get today's tasks
  const todayStr = new Date().toDateString();
  const todaysTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === todayStr);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bereket Kontrol Paneli</h1>
          <p className="text-muted">Tüm çiftlik operasyonlarınızın kalbi.</p>
        </div>
        <Link 
          href="/fields/new"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-strong"
        >
          + Yeni Bahçe Ekle
        </Link>
      </header>

      {loading ? (
        <div className="h-64 rounded-3xl border border-border bg-surface-muted flex items-center justify-center">
          <p className="text-muted">Veriler derleniyor...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            
            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 text-xl">
                🌍
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Toplam Alan</h3>
              <p className="text-3xl font-black text-foreground">
                {totalArea.toFixed(1)} <span className="text-lg text-muted font-medium">ha</span>
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4 text-xl">
                💰
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Net Bakiye</h3>
              <p className={`text-3xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {balance >= 0 ? '+' : ''}{balance.toLocaleString('tr-TR')} <span className="text-lg font-medium">₺</span>
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-4 text-xl">
                ⏳
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Bekleyen İşler</h3>
              <p className="text-3xl font-black text-foreground">
                {pendingTasks} <span className="text-lg text-muted font-medium">Görev</span>
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4 text-xl">
                🤖
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Yapay Zeka Durumu</h3>
              <p className="text-xl font-bold text-blue-700 mt-2">
                Aktif ve İzlemede
              </p>
            </div>

          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            
            {/* Quick Actions & Overview */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-foreground">Günün Özeti</h2>
                <p className="text-muted mt-1">Bugün planlanan {todaysTasks.length} adet göreviniz bulunuyor.</p>
                
                <div className="mt-6 space-y-3">
                  {todaysTasks.slice(0,3).map(t => (
                    <div key={t.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border/50">
                      <span className="text-2xl">📌</span>
                      <div>
                        <p className="font-bold text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.category}</p>
                      </div>
                    </div>
                  ))}
                  {todaysTasks.length === 0 && (
                    <p className="text-sm text-muted font-medium py-4">Bugün için özel bir plan bulunmuyor.</p>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-8 flex gap-4">
                <Link href="/advisor" className="rounded-xl bg-white border border-border px-6 py-3 text-sm font-bold text-foreground shadow-sm transition hover:bg-surface-muted">
                  Yapay Zeka'ya Danış
                </Link>
                <Link href="/fields" className="rounded-xl bg-white border border-border px-6 py-3 text-sm font-bold text-foreground shadow-sm transition hover:bg-surface-muted">
                  Haritayı Aç
                </Link>
              </div>
            </div>

            {/* Quick Finances */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">Son Finansal İşlemler</h2>
              
              <div className="space-y-4">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tx.type === 'Gelir' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'Gelir' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{tx.category}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-black ${tx.type === 'Gelir' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'Gelir' ? '+' : '-'}{tx.amount.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <p className="text-sm text-muted">İşlem bulunamadı.</p>
                )}
              </div>
              
              <Link href="/finances" className="mt-8 block text-center text-sm font-bold text-primary hover:underline">
                Tümünü Gör →
              </Link>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
