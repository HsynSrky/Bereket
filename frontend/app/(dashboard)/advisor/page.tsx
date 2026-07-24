"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getFields, type Field } from "@/lib/api/fields";
import { getWeatherForecast, type WeatherResponse } from "@/lib/api/weather";
import { getAdvisorResponse, type ChatMessage } from "@/lib/api/advisor";
import { getTasks, type FarmTask } from "@/lib/api/tasks";
import { getTransactions, type Transaction } from "@/lib/api/finances";

const QUICK_PROMPTS = [
  "Yapraklarda sararma var, ne yapmalıyım?",
  "Bugün ilaçlama yapmak için uygun mu?",
  "Gübreleme zamanı geldi mi?",
  "Sulama periyodumu nasıl ayarlamalıyım?"
];

export default function AdvisorPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [weatherData, setWeatherData] = useState<Record<string, WeatherResponse>>({});
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial load
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
        
        if (flds.length > 0) {
          setSelectedFieldId(flds[0].id);
        }
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  // Fetch weather when field changes
  useEffect(() => {
    if (!selectedFieldId) return;
    
    // Check if we already have weather for this field to avoid refetching
    if (weatherData[selectedFieldId]) return;

    const field = fields.find((f) => f.id === selectedFieldId);
    if (!field) return;

    async function loadWeather() {
      try {
        const data = await getWeatherForecast(field!.centerLat, field!.centerLng);
        setWeatherData(prev => ({ ...prev, [field!.id]: data }));
      } catch (err) {
        console.error("Weather fetch failed for advisor context", err);
      }
    }
    void loadWeather();
  }, [selectedFieldId, fields, weatherData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (loading) {
    return (
      <section className="flex h-[calc(100vh-100px)] items-center justify-center rounded-[28px] border border-border bg-surface">
        <p className="text-sm font-medium text-muted">Danışman hazırlanıyor...</p>
      </section>
    );
  }

  if (fields.length === 0) {
    return (
      <section className="rounded-[28px] border-2 border-dashed border-border bg-surface p-16 text-center shadow-sm">
        <p className="text-xl font-semibold text-foreground">
          Kayıtlı bahçeniz bulunamadı
        </p>
        <p className="mt-3 max-w-md mx-auto text-sm text-muted">
          Yapay zekanın size tarlanıza özel tavsiyeler verebilmesi için önce bir bahçe kaydetmelisiniz.
        </p>
        <Link
          href="/fields/new"
          className="mt-8 inline-flex rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-strong shadow-md shadow-primary/20"
        >
          Yeni Bahçe Ekle
        </Link>
      </section>
    );
  }

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;
  const selectedWeather = selectedField ? weatherData[selectedField.id] || null : null;

  async function handleSend(text: string) {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const aiResponseContent = await getAdvisorResponse(text, selectedField, selectedWeather, tasks, transactions);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  // A simple function to render basic markdown-like bold text (e.g. **text**)
  const renderMessageContent = (content: string) => {
    // Split by ** and map to bold tags
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col rounded-[32px] border border-border bg-surface shadow-sm overflow-hidden">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 bg-white/50 p-6 px-8 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Bereket Danışman</h1>
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Çevrimiçi
            </p>
          </div>
        </div>
        
        <div className="min-w-[200px]">
          <select
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.cropType || "Ürün Seçilmedi"})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 p-3 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-gradient-to-b from-transparent to-slate-50/30">
        
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl shadow-inner border border-indigo-100">
              🌱
            </div>
            <h2 className="text-2xl font-bold text-foreground">Size nasıl yardımcı olabilirim?</h2>
            <p className="mt-3 max-w-md text-muted">
              {selectedField?.name} tarlanızın hava durumu ve toprak verilerini analiz ettim. Karşılaştığınız sorunları veya sormak istediklerinizi yazabilirsiniz.
            </p>
            
            <div className="mt-10 grid gap-3 w-full max-w-2xl sm:grid-cols-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center rounded-2xl border border-border bg-white p-4 text-left text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
                >
                  <span className="mr-3 text-lg opacity-50">💡</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
              >
                <div 
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-br-sm" 
                      : "bg-white border border-border/60 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {renderMessageContent(msg.content)}
                  </div>
                  <span 
                    className={`block mt-2 text-[10px] uppercase font-bold tracking-wider ${
                      msg.role === "user" ? "text-primary-foreground/70 text-right" : "text-muted-foreground/50 text-left"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="flex items-center gap-2 rounded-3xl rounded-bl-sm border border-border/60 bg-white px-5 py-4 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-white p-4 sm:p-6">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="relative flex items-end gap-3 mx-auto max-w-4xl"
        >
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={`${selectedField?.name || "Tarlanız"} hakkında bir soru sorun... (örn: Gübreleme yapmalı mıyım?)`}
              className="w-full resize-none rounded-2xl border border-border bg-surface-muted px-5 py-4 pr-12 text-sm text-foreground placeholder-muted outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all min-h-[60px] max-h-[160px]"
              rows={1}
              disabled={isTyping}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground font-medium mt-3">
          Bereket Danışman yapay zekası hata yapabilir. Tarımsal kararlar alırken bir uzmana danışmanız tavsiye edilir.
        </p>
      </div>
    </div>
  );
}
