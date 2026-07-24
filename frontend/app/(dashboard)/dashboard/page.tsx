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
  
  const todayStr = new Date().toDateString();
  const todaysTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === todayStr);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Kontrol Paneli
          </h1>
          <p style={{ color: 'var(--muted)' }}>Tüm çiftlik operasyonlarınızın kalbi.</p>
        </div>
        <Link 
          href="/fields/new"
          className="btn-primary"
        >
          + Yeni Bahçe Ekle
        </Link>
      </header>

      {loading ? (
        <div className="h-64 card-3d flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p style={{ color: 'var(--muted)' }}>Veriler derleniyor...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4 stagger-children">
            
            {/* Total Area */}
            <div className="card-3d stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Toplam Alan</h3>
                  <p className="stat-value">
                    {totalArea.toFixed(1)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>hektar</p>
                </div>
                <div className="stat-icon">🌍</div>
              </div>
            </div>

            {/* Balance */}
            <div className="card-3d stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Net Bakiye</h3>
                  <p className="text-2xl font-bold" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {balance >= 0 ? '+' : ''}{balance.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{transactions.length} işlem</p>
                </div>
                <div className="stat-icon">💰</div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="card-3d stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Bekleyen İşler</h3>
                  <p className="stat-value">
                    {pendingTasks}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>görev</p>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.15)' }}>⏳</div>
              </div>
            </div>

            {/* AI Status */}
            <div className="card-3d stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Yapay Zeka</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)' }}></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--success)' }}></span>
                    </span>
                    <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Aktif</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>RAG motoru izlemede</p>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.15)' }}>🤖</div>
              </div>
            </div>

          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            
            {/* Daily Summary */}
            <div className="card-3d flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute inset-0 opacity-30 z-0" style={{
                background: 'radial-gradient(circle at top left, rgba(52, 211, 153, 0.1) 0%, transparent 60%)',
              }}></div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Günün Özeti</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  Bugün planlanan {todaysTasks.length} adet göreviniz bulunuyor.
                </p>
                
                <div className="mt-5 space-y-3">
                  {todaysTasks.slice(0,3).map(t => (
                    <div key={t.id} className="flex items-center gap-4 rounded-xl p-3 transition-all duration-300 hover:translate-x-1" style={{
                      background: 'rgba(52, 211, 153, 0.05)',
                      border: '1px solid rgba(52, 211, 153, 0.1)',
                    }}>
                      <span className="text-xl">📌</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{t.title}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.category}</p>
                      </div>
                    </div>
                  ))}
                  {todaysTasks.length === 0 && (
                    <p className="text-sm font-medium py-4" style={{ color: 'var(--muted)' }}>
                      Bugün için özel bir plan bulunmuyor.
                    </p>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-3">
                <Link href="/advisor" className="btn-primary text-sm">
                  🧠 AI&apos;ye Danış
                </Link>
                <Link href="/fields" className="btn-ghost text-sm">
                  🗺️ Haritayı Aç
                </Link>
              </div>
            </div>

            {/* Recent Finances */}
            <div className="card-3d">
              <h2 className="text-base font-bold mb-5" style={{ color: 'var(--foreground)' }}>Son İşlemler</h2>
              
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:translate-x-1" style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold" style={{
                        background: tx.type === 'Gelir' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: tx.type === 'Gelir' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${tx.type === 'Gelir' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                      }}>
                        {tx.type === 'Gelir' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{tx.category}</p>
                        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{new Date(tx.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{
                      color: tx.type === 'Gelir' ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {tx.type === 'Gelir' ? '+' : '-'}{tx.amount.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>İşlem bulunamadı.</p>
                )}
              </div>
              
              <Link href="/finances" className="mt-6 block text-center text-sm font-bold transition-colors hover:underline" style={{ color: 'var(--primary)' }}>
                Tümünü Gör →
              </Link>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
