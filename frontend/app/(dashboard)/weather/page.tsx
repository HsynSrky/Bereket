"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getFields, type Field } from "@/lib/api/fields";
import {
  getWeatherForecast,
  getWeatherDescription,
  getReverseGeocoding,
  type WeatherResponse,
  type LocationInfo
} from "@/lib/api/weather";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function WeatherPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const data = await getFields();
        setFields(data);
        if (data.length > 0) {
          setSelectedFieldId(data[0].id);
        }
      } catch (err) {
        setError("Bahçeler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  useEffect(() => {
    if (!selectedFieldId) return;

    const field = fields.find((f) => f.id === selectedFieldId);
    if (!field) return;

    async function loadData() {
      setWeatherLoading(true);
      try {
        // Fetch weather and location in parallel
        const [weatherData, locationData] = await Promise.all([
          getWeatherForecast(field!.centerLat, field!.centerLng),
          getReverseGeocoding(field!.centerLat, field!.centerLng)
        ]);
        
        setWeather(weatherData);
        setLocation(locationData);
      } catch (err) {
        setError("Veriler alınamadı.");
      } finally {
        setWeatherLoading(false);
      }
    }

    void loadData();
  }, [selectedFieldId, fields]);

  // Derived Data Calculations
  const chartData = useMemo(() => {
    if (!weather) return [];
    const currentHourIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= Date.now());
    const startIndex = Math.max(0, currentHourIndex - 2); // Show a bit of the past
    
    return weather.hourly.time.slice(startIndex, startIndex + 24).map((time, index) => ({
      time: new Date(time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      Sıcaklık: weather.hourly.temperature_2m[startIndex + index],
      Yağış_İhtimali: weather.hourly.precipitation_probability[startIndex + index],
    }));
  }, [weather]);

  const sprayingWindow = useMemo(() => {
    if (!weather) return null;
    const currentHourIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= Date.now());
    if (currentHourIndex === -1) return null;
    
    // Look ahead 24 hours
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
      const wind = weather.hourly.windspeed_10m[i];
      const rain = weather.hourly.precipitation_probability[i];
      if (wind < 15 && rain === 0) {
        // Found a good hour. Find the end of this block.
        let endIdx = i;
        while (endIdx < currentHourIndex + 24 && weather.hourly.windspeed_10m[endIdx] < 15 && weather.hourly.precipitation_probability[endIdx] === 0) {
          endIdx++;
        }
        
        const startTime = new Date(weather.hourly.time[i]);
        const endTime = new Date(weather.hourly.time[endIdx - 1]);
        
        const isToday = startTime.toDateString() === new Date().toDateString();
        
        return {
          day: isToday ? "Bugün" : "Yarın",
          start: startTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          end: endTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        };
      }
    }
    return null;
  }, [weather]);

  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-[28px] border border-border bg-surface p-12">
        <p className="text-sm font-medium text-muted">Yükleniyor...</p>
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
          Tarımsal meteoroloji verilerini görebilmek için önce harita üzerinden bahçenizin konumunu kaydetmelisiniz.
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

  const currentDesc = weather ? getWeatherDescription(weather.current_weather.weathercode) : null;
  const isFrostRisk = weather && weather.daily.temperature_2m_min.some(temp => temp <= 2);
  const isGaleRisk = weather && weather.daily.windspeed_10m_max.some(wind => wind >= 40);

  // Today's indices
  const todayIndex = 0; 
  const currentHourIndex = weather ? Math.max(0, weather.hourly.time.findIndex(t => new Date(t).getTime() >= Date.now())) : 0;
  
  const soilTemp = weather ? weather.hourly.soil_temperature_18cm[currentHourIndex] : 0;
  const soilMoist = weather ? weather.hourly.soil_moisture_9_to_27cm[currentHourIndex] : 0;
  const et0 = weather ? weather.daily.et0_fao_evapotranspiration[todayIndex] : 0;

  const locName = location 
    ? [location.village, location.town, location.city].filter(Boolean).join(" / ")
    : "Konum Bilgisi Alınıyor...";

  return (
    <div className="space-y-6">
      {/* Header & Selection */}
      <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            AgTech Noktasal Analiz
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Hava & Toprak Durumu</h1>
        </div>
        <div className="min-w-[240px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="fieldSelect">
            Bahçe Seçimi
          </label>
          <select
            id="fieldSelect"
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.cropType || "Belirtilmedi"})
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </section>
      ) : null}

      {/* Warnings */}
      <div className="flex flex-col gap-3 md:flex-row">
        {isFrostRisk && (
          <div className="flex-1 rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-sm">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <span className="text-xl">❄️</span> Don Riski Uyarısı
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Önümüzdeki günlerde sıcaklığın 2°C altına düşmesi bekleniyor. Tarımsal önlemlerinizi alınız.
            </p>
          </div>
        )}
        {isGaleRisk && (
          <div className="flex-1 rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm">
            <h3 className="font-bold text-orange-900 flex items-center gap-2">
              <span className="text-xl">🌪️</span> Fırtına İhtimali
            </h3>
            <p className="mt-1 text-sm text-orange-800">
              Şiddetli rüzgar uyarısı (40+ km/s). Bitki koruma ürünleri uygulamasından kaçının.
            </p>
          </div>
        )}
      </div>

      {weatherLoading ? (
        <div className="rounded-[28px] border border-border bg-surface p-12 text-center">
          <p className="text-muted">Gelişmiş meteorolojik veriler işleniyor...</p>
        </div>
      ) : weather && currentDesc ? (
        <div className="space-y-6">
          
          {/* Main AgTech Dash Grid */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr_1fr]">
            
            {/* 1. Main Weather & Location Card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-700 p-8 text-white shadow-xl">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-6xl font-black">{Math.round(weather.current_weather.temperature)}°</h2>
                    <p className="mt-2 text-xl font-medium">{currentDesc.label}</p>
                  </div>
                  <span className="text-6xl">{currentDesc.icon}</span>
                </div>
                
                <div className="mt-8 flex items-center gap-2 rounded-xl bg-black/20 p-3 text-sm backdrop-blur-md">
                  <span>📍</span>
                  <span className="font-medium">{locName || "Konum aranıyor..."}</span>
                </div>
              </div>
            </div>

            {/* 2. Spraying Window Card */}
            <div className="flex flex-col justify-between rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                  <span className="text-2xl">🚜</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-emerald-900">İlaçlama Penceresi</h3>
                {sprayingWindow ? (
                  <p className="mt-2 text-sm text-emerald-800 font-medium">
                    {sprayingWindow.day} <span className="font-bold bg-emerald-200 px-2 py-0.5 rounded-md">{sprayingWindow.start} - {sprayingWindow.end}</span> arası rüzgar ve yağış durumu optimum.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-red-700 font-medium">
                    Önümüzdeki 24 saat ilaçlama (püskürtme) için uygun görünmüyor. Yüksek rüzgar veya yağış ihtimali var.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Soil Data Card */}
            <div className="flex flex-col justify-between rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-amber-900">Toprak Analizi</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between border-b border-amber-200/50 pb-2">
                    <span className="text-sm text-amber-800">Toprak Sıcaklığı (18cm)</span>
                    <span className="font-bold text-amber-900">{soilTemp.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-200/50 pb-2">
                    <span className="text-sm text-amber-800">Toprak Nemi</span>
                    <span className="font-bold text-amber-900">{(soilMoist * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-800">Su Kaybı (ET0)</span>
                    <span className="font-bold text-amber-900">{et0.toFixed(1)} mm</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Chart & Daily Forecast Grid */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            
            {/* 24 Hour Forecast Chart */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">24 Saatlik Tahmin</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="Sıcaklık" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    <Area yAxisId="right" type="monotone" dataKey="Yağış_İhtimali" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sun & UV Card */}
            <div className="flex flex-col justify-between rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">Zirai Gün Işığı</h3>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌅</span>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted">Gündoğumu</p>
                      <p className="font-bold text-foreground">
                        {new Date(weather.daily.sunrise[todayIndex]).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌇</span>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted">Günbatımı</p>
                      <p className="font-bold text-foreground">
                        {new Date(weather.daily.sunset[todayIndex]).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌞</span>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted">Maks. UV İndeksi</p>
                      <p className="font-bold text-foreground">
                        {weather.daily.uv_index_max[todayIndex]} 
                        <span className="ml-2 text-xs text-muted font-normal">
                          {weather.daily.uv_index_max[todayIndex] > 8 ? "(Çok Yüksek)" : "Normal"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 7-Day Forecast */}
          <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">Haftalık Genel Bakış</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
              {weather.daily.time.map((timeStr, index) => {
                const dayDesc = getWeatherDescription(weather.daily.weathercode[index]);
                const maxTemp = Math.round(weather.daily.temperature_2m_max[index]);
                const minTemp = Math.round(weather.daily.temperature_2m_min[index]);
                const dateObj = new Date(timeStr);
                const isToday = new Date().toDateString() === dateObj.toDateString();

                return (
                  <div key={timeStr} className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition ${isToday ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-surface-muted/50'}`}>
                    <span className="text-xs font-semibold uppercase text-muted">
                      {isToday ? "Bugün" : dateObj.toLocaleDateString("tr-TR", { weekday: "short" })}
                    </span>
                    <span className="my-3 text-3xl">{dayDesc.icon}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-foreground">{maxTemp}°</span>
                      <span className="text-muted">{minTemp}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
