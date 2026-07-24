"use client";

import { useEffect, useState, useMemo } from "react";
import { getFields, type Field } from "@/lib/api/fields";
import { getTasks, createTask, type FarmTask } from "@/lib/api/tasks";
import { getWeatherForecast, type WeatherResponse } from "@/lib/api/weather";

const TASK_CATEGORIES = ["İlaçlama", "Sulama", "Gübreleme", "Hasat", "Sürüm", "Bakım", "Diğer"];
const TASK_STATUSES = ["Bekliyor", "Tamamlandı", "İptal"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherResponse>>({});
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(TASK_CATEGORIES[0]);
  const [fieldId, setFieldId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [taskData, fieldData] = await Promise.all([getTasks(), getFields()]);
        setTasks(taskData);
        setFields(fieldData);
        
        // Fetch weather for fields that have pending tasks
        const pendingFields = new Set(
          taskData.filter(t => t.status === "Bekliyor" && t.fieldId).map(t => t.fieldId)
        );
        
        for (const fid of pendingFields) {
          const f = fieldData.find(x => x.id === fid);
          if (f) {
            getWeatherForecast(f.centerLat, f.centerLng).then(w => {
              setWeatherData(prev => ({ ...prev, [f.id]: w }));
            });
          }
        }
      } catch (err) {
        console.error("Görev verileri alınamadı", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    setIsSubmitting(true);
    try {
      const newTask = await createTask({
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        status: "Bekliyor",
        category,
        fieldId: fieldId || null,
      });
      setTasks([...tasks, newTask]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      alert("Görev kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSmartWarning = (task: FarmTask) => {
    if (task.status !== "Bekliyor" || !task.fieldId) return null;
    const weather = weatherData[task.fieldId];
    if (!weather) return null;

    const taskDateStr = new Date(task.dueDate).toDateString();
    const todayStr = new Date().toDateString();
    
    // Only warn for today's tasks using current weather
    if (taskDateStr === todayStr) {
      const wind = weather.current_weather.windspeed;
      const temp = weather.current_weather.temperature;
      
      if (task.category === "İlaçlama") {
        if (wind > 15) return { type: "danger", msg: `Rüzgar çok şiddetli (${wind} km/s). İlaçlamayı erteleyin.` };
        if (temp > 28) return { type: "warning", msg: `Sıcaklık çok yüksek (${temp}°C). Akşam üstü ilaçlayın.` };
      }
      if (task.category === "Sulama") {
        if (temp < 0) return { type: "danger", msg: "Don riski var, sulama yapmayın!" };
      }
    }
    return null;
  };

  const columns = [
    { title: "Bekliyor", status: "Bekliyor", color: "bg-amber-100/50 text-amber-900 border-amber-200" },
    { title: "Tamamlandı", status: "Tamamlandı", color: "bg-emerald-100/50 text-emerald-900 border-emerald-200" },
  ];

  if (loading) {
    return <div className="p-12 text-center text-muted">Görevler yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Görev Planlayıcı</h1>
          <p className="text-muted">Tarımsal operasyonlarınızı ve takviminizi yönetin.</p>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        
        {/* Add Task Form */}
        <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-foreground mb-4">Yeni Görev</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground uppercase">Görev Adı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 1. Üst Gübreleme"
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground uppercase">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground uppercase">Tarih</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground uppercase">İlgili Tarla (Opsiyonel)</label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Seçilmedi</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted-foreground uppercase">Detaylı Not</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[60px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary mt-2 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-50"
            >
              {isSubmitting ? "Ekleniyor..." : "Görevi Ekle"}
            </button>
          </form>
        </div>

        {/* Kanban Board */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {columns.map(col => (
            <div key={col.status} className={`rounded-[32px] border bg-surface p-6 ${col.color}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">{col.title}</h3>
                <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold">
                  {tasks.filter(t => t.status === col.status).length}
                </span>
              </div>
              
              <div className="space-y-4">
                {tasks.filter(t => t.status === col.status).map(task => {
                  const warning = getSmartWarning(task);
                  const field = fields.find(f => f.id === task.fieldId);
                  const dateColor = new Date(task.dueDate) < new Date() && col.status !== "Tamamlandı" 
                    ? "text-red-500 font-bold" 
                    : "text-muted-foreground";

                  return (
                    <div key={task.id} className="rounded-2xl border border-white bg-white/70 p-4 shadow-sm backdrop-blur-md">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-black/5 px-2 py-1 rounded-md">
                          {task.category}
                        </span>
                        <span className={`text-xs ${dateColor}`}>
                          {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-foreground">{task.title}</h4>
                      
                      {field && (
                        <p className="text-xs font-semibold text-primary mt-1">📍 {field.name}</p>
                      )}
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                      )}

                      {/* Akıllı Tarım Uyarısı */}
                      {warning && (
                        <div className={`mt-3 flex items-start gap-2 p-2 rounded-lg text-xs font-semibold ${warning.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          <span>⚠️</span>
                          <p>{warning.msg}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {tasks.filter(t => t.status === col.status).length === 0 && (
                  <p className="text-center text-sm font-medium opacity-50 py-4">Bu sütun boş.</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
