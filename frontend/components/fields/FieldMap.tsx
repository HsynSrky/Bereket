"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, ImageOverlay, useMap } from "react-leaflet";
import "leaflet-draw";
import { useMemo } from "react";

const DEFAULT_CENTER: [number, number] = [39.0, 35.0];
const DEFAULT_ZOOM = 6;

type FieldMapProps = {
  initialGeoJson?: string;
  center?: [number, number];
  zoom?: number;
  ndviUrl?: string | null;
  onPolygonChange: (geoJson: string) => void;
};

function configureLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function DrawControl({
  initialGeoJson,
  onPolygonChange,
}: {
  initialGeoJson?: string;
  onPolygonChange: (geoJson: string) => void;
}) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const onPolygonChangeRef = useRef(onPolygonChange);

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange;
  }, [onPolygonChange]);

  useEffect(() => {
    configureLeafletIcons();

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });

    map.addControl(drawControl);

    if (initialGeoJson) {
      const layer = L.geoJSON(JSON.parse(initialGeoJson) as GeoJSON.GeoJsonObject);
      layer.eachLayer((featureLayer) => {
        drawnItems.addLayer(featureLayer);
      });

      const bounds = drawnItems.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }
    }

    const handleCreated = (event: L.LeafletEvent) => {
      const created = event as L.DrawEvents.Created;
      drawnItems.clearLayers();
      drawnItems.addLayer(created.layer);
      const geoLayer = created.layer as L.Polygon;
      onPolygonChangeRef.current(JSON.stringify(geoLayer.toGeoJSON()));
    };

    const handleEdited = (event: L.LeafletEvent) => {
      const edited = event as L.DrawEvents.Edited;
      edited.layers.eachLayer((layer) => {
        const geoLayer = layer as L.Polygon;
        onPolygonChangeRef.current(JSON.stringify(geoLayer.toGeoJSON()));
      });
    };

    const handleDeleted = () => {
      onPolygonChangeRef.current("");
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [initialGeoJson, map]);

  return null;
}

export default function FieldMap({
  initialGeoJson,
  center,
  zoom,
  ndviUrl,
  onPolygonChange,
}: FieldMapProps) {
  
  const bounds = useMemo(() => {
    if (!initialGeoJson || !ndviUrl) return null;
    try {
      const geoLayer = L.geoJSON(JSON.parse(initialGeoJson));
      const b = geoLayer.getBounds();
      return b.isValid() ? b : null;
    } catch {
      return null;
    }
  }, [initialGeoJson, ndviUrl]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={center ?? DEFAULT_CENTER}
        zoom={zoom ?? DEFAULT_ZOOM}
        className="h-full w-full min-h-[420px]"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl
          initialGeoJson={initialGeoJson}
          onPolygonChange={onPolygonChange}
        />
        {ndviUrl && bounds && (
          <ImageOverlay
            url={ndviUrl}
            bounds={bounds}
            opacity={0.8}
            zIndex={10}
          />
        )}
      </MapContainer>
    </div>
  );
}
