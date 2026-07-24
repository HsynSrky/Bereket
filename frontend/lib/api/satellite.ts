import { type Field } from "./fields";

export type SatelliteImage = {
  dt: number;
  type: string;
  dc: number;
  cl: number;
  image: {
    truecolor: string;
    falsecolor: string;
    ndvi: string;
    evi: string;
  };
};

export type PolygonResponse = {
  id: string;
  name: string;
  geo_json: any;
  area: number;
  center: number[];
};

const AGRO_API_KEY = "test"; // Using Agromonitoring test API key for development
const AGRO_BASE_URL = "http://api.agromonitoring.com/agro/1.0";

// 1. Tarlayı Agromonitoring API'sine kaydet (Polygon ID almak için)
export async function createAgroPolygon(field: Field): Promise<PolygonResponse> {
  const geojson = typeof field.polygonGeoJson === 'string' 
    ? JSON.parse(field.polygonGeoJson) 
    : field.polygonGeoJson;
  
  // Format geojson for agromonitoring API
  const formattedGeoJson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: geojson.geometry?.coordinates || geojson.coordinates
    }
  };

  const response = await fetch(`${AGRO_BASE_URL}/polygons?appid=${AGRO_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: field.name,
      geo_json: formattedGeoJson
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Agromonitoring poligon oluşturulamadı: " + errorText);
  }

  return response.json();
}

// 2. Seçili Polygon ID'si için NDVI uydu görüntülerini çek
export async function getSatelliteImages(polyId: string): Promise<SatelliteImage[]> {
  const endDate = Math.floor(Date.now() / 1000); // Now
  const startDate = endDate - (30 * 24 * 60 * 60); // 30 days ago
  
  const response = await fetch(`${AGRO_BASE_URL}/image/search?start=${startDate}&end=${endDate}&polyid=${polyId}&appid=${AGRO_API_KEY}`);
  
  if (!response.ok) {
    throw new Error("Uydu görüntüleri alınamadı.");
  }
  
  return response.json();
}
