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
          getFields(), getTasks(), getTransactions()
        ]);
        setFields(flds);
        setTasks(tsks);
        setTransactions(txs);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    void init();
  }, []);

  const totalArea = fields.reduce((sum, f) => sum + f.areaSqMeters, 0) / 10000;
  const income = transactions.filter(t => t.type === "Gelir").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "Gider").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const pendingTasks = tasks.filter(t => t.status === "Bekliyor").length;
  const todayStr = new Date().toDateString();
  const todaysTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === todayStr);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--foreground)', letterSpacing: '-0.025em' }}>
            Genel Bakış
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Çiftlik operasyonlarınızın özeti.
          </p>
        </div>
        <Link href="/fields/new" className="btn btn-primary">
          + Yeni Bahçe
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="animate-in delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <div className="card stat-card">
          <p className="stat-label">Toplam Alan</p>
          <p className="stat-value">{totalArea.toFixed(1)}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--muted)', marginLeft: '0.25rem' }}>ha</span></p>
          <p className="stat-change" style={{ color: 'var(--muted)' }}>{fields.length} bahçe kayıtlı</p>
        </div>

        <div className="card stat-card">
          <p className="stat-label">Gelir</p>
          <p className="stat-value" style={{ color: 'var(--success)' }}>+{income.toLocaleString('tr-TR')}<span style={{ fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.125rem' }}>₺</span></p>
          <p className="stat-change" style={{ color: 'var(--muted)' }}>{transactions.filter(t=>t.type==="Gelir").length} işlem</p>
        </div>

        <div className="card stat-card">
          <p className="stat-label">Gider</p>
          <p className="stat-value" style={{ color: 'var(--danger)' }}>-{expense.toLocaleString('tr-TR')}<span style={{ fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.125rem' }}>₺</span></p>
          <p className="stat-change" style={{ color: 'var(--muted)' }}>{transactions.filter(t=>t.type==="Gider").length} işlem</p>
        </div>

        <div className="card stat-card">
          <p className="stat-label">Bekleyen Görevler</p>
          <p className="stat-value">{pendingTasks}</p>
          <p className="stat-change" style={{ color: 'var(--muted)' }}>{tasks.length} toplam görev</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="animate-in delay-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
        
        {/* Today's Tasks */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Bugünün Görevleri</h2>
            <Link href="/tasks" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>
              Tümünü gör →
            </Link>
          </div>

          {todaysTasks.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--surface-muted)',
              borderRadius: '8px',
            }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Bugün için planlanmış görev yok.</p>
              <Link href="/tasks" className="btn btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                Görev Ekle
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todaysTasks.slice(0, 5).map(t => (
                <div key={t.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  transition: 'background 0.15s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: t.status === 'Tamamlandı' ? 'var(--success)' : t.status === 'Bekliyor' ? 'var(--warning)' : 'var(--info)',
                    }} />
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>{t.title}</p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>{t.category}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${t.status === 'Tamamlandı' ? 'success' : 'warning'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Finances */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>Son İşlemler</h2>
            <Link href="/finances" style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>
              Tümünü gör →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {transactions.slice(0, 6).map(tx => (
              <div key={tx.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)' }}>{tx.description || tx.category}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>
                    {new Date(tx.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: tx.type === 'Gelir' ? 'var(--success)' : 'var(--danger)',
                }}>
                  {tx.type === 'Gelir' ? '+' : '−'}{tx.amount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            ))}

            {transactions.length === 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', padding: '1rem 0', textAlign: 'center' }}>
                Henüz işlem yok.
              </p>
            )}
          </div>

          {/* Net Balance bar */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: balance >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${balance >= 0 ? 'var(--success-border)' : 'var(--danger-border)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                Net Bakiye
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {balance >= 0 ? '+' : ''}{balance.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-in delay-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          { href: "/advisor", icon: "◎", title: "AI Danışman", desc: "Yapay zekadan tarımsal tavsiye alın", color: 'var(--accent-violet)' },
          { href: "/fields", icon: "⬡", title: "Bahçeleri Gör", desc: "Tarlalarınızı haritada inceleyin", color: 'var(--primary)' },
          { href: "/inventory", icon: "⊞", title: "Envanter", desc: "Depo stoğunuzu kontrol edin", color: 'var(--accent-amber)' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="card-interactive" style={{ padding: '1.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.125rem',
              background: `${action.color}10`, color: action.color,
              border: `1px solid ${action.color}20`,
              marginBottom: '0.75rem',
            }}>
              {action.icon}
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{action.title}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
