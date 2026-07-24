export type WeatherCurrent = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
};

export type WeatherDaily = {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  windspeed_10m_max: number[];
  et0_fao_evapotranspiration: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
};

export type WeatherHourly = {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  windspeed_10m: number[];
  soil_temperature_18cm: number[];
  soil_moisture_9_to_27cm: number[];
};

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather: WeatherCurrent;
  daily: WeatherDaily;
  hourly: WeatherHourly;
};

export type LocationInfo = {
  city: string;
  town: string;
  village: string;
  display_name: string;
};

export async function getWeatherForecast(lat: number, lng: number): Promise<WeatherResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,precipitation_probability,windspeed_10m,soil_temperature_18cm,soil_moisture_9_to_27cm&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,et0_fao_evapotranspiration,sunrise,sunset,uv_index_max&timezone=auto`;
  
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Hava durumu verisi alınamadı.");
  }

  return response.json() as Promise<WeatherResponse>;
}

export async function getReverseGeocoding(lat: number, lng: number): Promise<LocationInfo | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'AgriOS-FarmTech/1.0'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      city: data.address?.province || data.address?.city || data.address?.state || "",
      town: data.address?.town || data.address?.county || "",
      village: data.address?.village || data.address?.suburb || "",
      display_name: data.display_name || ""
    };
  } catch {
    return null;
  }
}

export function getWeatherDescription(code: number): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: "Açık", icon: "☀️" };
    case 1:
      return { label: "Çoğunlukla Açık", icon: "🌤️" };
    case 2:
      return { label: "Parçalı Bulutlu", icon: "⛅" };
    case 3:
      return { label: "Kapalı", icon: "☁️" };
    case 45:
    case 48:
      return { label: "Sisli", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { label: "Çisenti", icon: "🌧️" };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return { label: "Yağmurlu", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: "Karlı", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { label: "Sağanak", icon: "🌦️" };
    case 85:
    case 86:
      return { label: "Kar Sağanağı", icon: "🌨️" };
    case 95:
    case 96:
    case 99:
      return { label: "Fırtına", icon: "⛈️" };
    default:
      return { label: "Bilinmiyor", icon: "🌈" };
  }
}
