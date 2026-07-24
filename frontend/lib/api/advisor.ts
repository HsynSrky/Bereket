import { type Field } from "./fields";
import { type WeatherResponse } from "./weather";
import { type Transaction } from "./finances";
import { type FarmTask } from "./tasks";

export type ChatMessage = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
};

// --- BEREKET V3 ALGORİTMALARI ---

// 1. GDD (Growing Degree Days - Büyüme Derecesi Günleri) Modeli
function calculateGDD(weather: WeatherResponse, crop: string): string {
  // GDD = (Tmax + Tmin)/2 - Tbase
  // Tbase mısır/pamuk için ~10, buğday için ~5 kabul edilir.
  const tBase = (crop.toLowerCase().includes("buğday") || crop.toLowerCase().includes("arpa")) ? 5 : 10;
  
  let totalGDD = 0;
  for(let i=0; i<7; i++) {
    const minT = weather.daily.temperature_2m_min[i];
    const maxT = weather.daily.temperature_2m_max[i];
    const avg = (minT + maxT) / 2;
    if (avg > tBase) totalGDD += (avg - tBase);
  }

  return `Son 7 günlük hava verisine göre tarlanızda ${totalGDD.toFixed(1)} GDD (Isı Birikimi) sağlandı. Bu, bitkinizin fotosentez ve hücre bölünme hızının ${totalGDD > 70 ? 'oldukça yüksek' : 'stabil'} olduğunu gösteriyor. Bir sonraki fenolojik evre (örn. sapa kalkma/çiçeklenme) beklenenden erken gerçekleşebilir.`;
}

// 2. Ekonomik ROI (Yatırım Getirisi) Modeli
function calculateROI(field: Field, transactions: Transaction[]): string {
  if (!field.areaSqMeters) return "Tarlanızı haritada çizmediğiniz için rekolte/getiri tahmini yapılamıyor.";
  
  // Rekolte tahmini
  const YIELD_RATES: Record<string, number> = {
    "Buğday": 3.5, "Arpa": 3.0, "Mısır": 9.0, "Ayçiçeği": 2.5, "Pamuk": 4.5,
  };
  const rate = YIELD_RATES[field.cropType || "Buğday"] || 3.0;
  const yieldTons = (field.areaSqMeters / 10000) * rate;

  // Gider Hesaplaması
  const totalExpenses = transactions.filter(t => t.type === 'Gider').reduce((sum, t) => sum + t.amount, 0);
  
  // Ortalama Piyasa Fiyatı (Örn: Buğday 9000 TL/Ton, Mısır 6000 TL/Ton vs)
  const MARKET_PRICES: Record<string, number> = {
    "Buğday": 9500, "Arpa": 8000, "Mısır": 6500, "Ayçiçeği": 14000, "Pamuk": 22000,
  };
  const pricePerTon = MARKET_PRICES[field.cropType || "Buğday"] || 8000;
  const estimatedRevenue = yieldTons * pricePerTon;
  
  const expectedProfit = estimatedRevenue - totalExpenses;

  return `📊 **ROI Analizi:** Mevcut giderleriniz ${totalExpenses.toLocaleString('tr-TR')} ₺. Tarlanızın yüzölçümüne göre beklenen rekolte ${yieldTons.toFixed(1)} Ton. Güncel piyasa ortalamasıyla (${pricePerTon} ₺/Ton) beklenen brüt geliriniz ${estimatedRevenue.toLocaleString('tr-TR')} ₺. Hasat sonu beklenen net Kârınız: **${expectedProfit.toLocaleString('tr-TR')} ₺**.`;
}

// 3. Gelişmiş Zararlı (Pest) Uyanış Modeli
function calculatePestEmergence(weather: WeatherResponse, crop: string): string {
  const maxTemps = weather.daily.temperature_2m_max.slice(0, 5);
  const minTemps = weather.daily.temperature_2m_min.slice(0, 5);
  
  let consecutiveWarmDays = 0;
  for(let i=0; i<maxTemps.length; i++) {
    if (maxTemps[i] > 25 && minTemps[i] > 12) consecutiveWarmDays++;
  }

  if (consecutiveWarmDays >= 3) {
    return `🚨 **Zararlı Alarmı:** Üst üste 3 günden fazla sıcaklığın 25°C üstünde seyretmesi, ${crop} bitkisinde yaprak bitleri ve yeşil kurt gibi zararlıların kuluçkadan çıkışını tetiklemektedir. Hafta sonu tarlanızda mutlaka görsel kontrol yapın.`;
  }
  return `Şu anki ısı ve nem değerleri majör böcek/zararlı popülasyonlarının patlaması için eşik değerin altındadır.`;
}

// 4. İlaçlama ve Hastalık (Eski + Yeni Kombinasyonu)
function calculateDiseaseAndSpraying(weather: WeatherResponse): string {
  const wind = Math.round(weather.current_weather.windspeed);
  let riskScore = 0;
  for(let i=0; i<3; i++) {
    const avgTemp = (weather.daily.temperature_2m_min[i] + weather.daily.temperature_2m_max[i]) / 2;
    if (avgTemp >= 15 && avgTemp <= 25) riskScore += 1;
  }
  
  const sprayAdvice = wind > 15 ? `Rüzgar ${wind} km/s. İlaçlama için RİSKLİ (Sürüklenme kaybı yüksek).` : `Rüzgar ${wind} km/s. İlaçlama için UYGUN.`;
  const diseaseAdvice = riskScore >= 2 ? `Sıcaklık 15-25°C bandında olduğu için fungal (mantari) hastalık riski ORTA/YÜKSEK.` : `Hastalık riski DÜŞÜK.`;

  return `🛡️ **Bitki Sağlığı ve İlaçlama Analizi:**\n\n- ${diseaseAdvice}\n- ${sprayAdvice}`;
}

// 5. Su Stresi (Sulama)
function calculateWaterDeficit(weather: WeatherResponse): string {
  const totalET0 = weather.daily.et0_fao_evapotranspiration[0] + weather.daily.et0_fao_evapotranspiration[1];
  if (totalET0 > 8) {
    return `💧 **Sulama Tavsiyesi:** Son 48 saatteki agresif buharlaşma nedeniyle toprağınız m² başına net ${totalET0.toFixed(1)} litre su kaybediyor. Sulama planlamanız tavsiye edilir.`;
  }
  return `💧 **Sulama Tavsiyesi:** Buharlaşma (${totalET0.toFixed(1)} mm) normal. Acil sulama ihtiyacı görünmüyor.`;
}

export async function getAdvisorResponse(
  message: string,
  field: Field | null,
  weather: WeatherResponse | null,
  tasks: FarmTask[] | null,
  transactions: Transaction[] | null
): Promise<string> {
  
  // Simulate LLM Network Call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const msg = message.toLowerCase();
  
  // --- RAG CONTEXT INJECTION (Retrieval-Augmented Generation) ---
  // In a real LLM call, we would inject this into the "system" prompt.
  // Here we use it directly to construct our hyper-intelligent response.
  
  if (!field || !weather || !tasks || !transactions) {
    return "RAG Mimarisi için tam kontekst kurulamadı. Lütfen haritadan tarlanızı seçtiğinizden emin olun.";
  }
  
  const crop = field.cropType || "ürün";
  const pendingTaskCount = tasks.filter(t => t.status !== 'Tamamlandı').length;

  if (msg.includes("roi") || msg.includes("ekonomi") || msg.includes("kâr") || msg.includes("zarar") || msg.includes("para")) {
    return calculateROI(field, transactions);
  }

  if (msg.includes("gelişim") || msg.includes("gdd") || msg.includes("derece") || msg.includes("hasat") || msg.includes("gübre")) {
    return `🌱 **Biyolojik Gelişim (GDD) Raporu:**\n\n${calculateGDD(weather, crop)}\n\n*Dipnot:* Gübreleme programınızı bitkinin bu ısı birikimine göre ayarlamanız verimi maksimize edecektir. Bekleyen ${pendingTaskCount} göreviniz var.`;
  }

  if (msg.includes("böcek") || msg.includes("zararlı") || msg.includes("kurt") || msg.includes("ilaç") || msg.includes("hastalık") || msg.includes("sararma") || msg.includes("leke")) {
    return calculatePestEmergence(weather, crop) + "\n\n" + calculateDiseaseAndSpraying(weather);
  }

  if (msg.includes("su") || msg.includes("sulama") || msg.includes("kuruma")) {
    return calculateWaterDeficit(weather);
  }
  
  // RAG Tabanlı Genel Asistan Yanıtı
  return `🤖 **Bereket RAG AI Motoru:**\n\nSorusunu sorduğunuz konuyu tam saptayamadım ancak size genel **RAG** özetini sunabilirim:\n\n` +
         `- **Finans:** Toplam ${transactions.length} işleminiz var.\n` + 
         `- **İşler:** ${pendingTaskCount} bekleyen zirai operasyonunuz var.\n` +
         `- **Tarla Durumu:** ${field.name} (${crop}) için sıcaklık birikimi devam ediyor.\n\n` +
         `Lütfen "ROI analizimi ver", "Böcek riski var mı?" veya "GDD gelişim durumu nedir?" şeklinde özel algoritmalarımı tetikleyecek komutlar verin.`;
}
