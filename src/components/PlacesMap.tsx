import React, { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { LatLng } from "@/services/location";

export type MapMarker = { id: string; lat: number; lng: number; color: string; label: string; title: string };

type Props = {
  markers: MapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  origin: (LatLng & { source?: string }) | null;
  /** Bumped by the parent to re-centre on the user / fit all markers. */
  recenterKey: number;
};

const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const pinSize = (selected: boolean) => (selected ? 38 : 30);

const pinHtml = (color: string, label: string, selected: boolean) =>
  `<div style="width:100%;height:100%;box-sizing:border-box;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);color:#fff;font:700 ${selected ? 13 : 11}px/1 sans-serif;display:flex;align-items:center;justify-content:center">${label}</div>`;

/**
 * Real OpenStreetMap map (Leaflet). Leaflet is loaded lazily so it stays out of the main bundle.
 * Tiles come from tile.openstreetmap.org (light use, attribution shown as required by the OSM tile policy).
 */
const PlacesMap = ({ markers, selectedId, onSelect, origin, recenterKey }: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markerRefs = useRef(new Map<string, { marker: Marker; data: MapMarker }>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const fitted = useRef(false);

  const fit = () => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    const points = [...markerRefs.current.values()].map(({ data }) => [data.lat, data.lng] as [number, number]);
    if (origin?.source === "device") map.setView([origin.lat, origin.lng], 13);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 13 });
    else if (points.length === 1) map.setView(points[0], 14);
    else if (origin) map.setView([origin.lat, origin.lng], 12);
  };

  // create the map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ default: L }] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
      if (cancelled || !container.current) return;
      leafletRef.current = L;
      const map = L.map(container.current, { zoomControl: false, attributionControl: true }).setView([origin?.lat ?? 36.5, origin?.lng ?? 127.8], origin ? 12 : 7);
      L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      mapRef.current = map;
      // marker layer is filled by the effect below once the map exists
      setTimeout(() => map.invalidateSize(), 0);
      syncMarkers();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRefs.current.clear();
      fitted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncMarkers = () => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    const wanted = new Map(markers.map((m) => [m.id, m]));
    for (const [id, entry] of markerRefs.current) {
      if (!wanted.has(id)) {
        entry.marker.remove();
        markerRefs.current.delete(id);
      }
    }
    for (const data of markers) {
      const selected = data.id === selectedId;
      const existing = markerRefs.current.get(data.id);
      const size = pinSize(selected);
      const icon = L.divIcon({ className: "", html: pinHtml(data.color, data.label, selected), iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      if (existing) {
        existing.data = data;
        existing.marker.setIcon(icon).setZIndexOffset(selected ? 1000 : 0);
      } else {
        const marker = L.marker([data.lat, data.lng], { icon, title: data.title, riseOnHover: true, zIndexOffset: selected ? 1000 : 0 })
          .addTo(map)
          .on("click", () => onSelectRef.current(data.id));
        markerRefs.current.set(data.id, { marker, data });
      }
    }
    if (!fitted.current && markers.length > 0) {
      fitted.current = true;
      fit();
    }
  };

  useEffect(syncMarkers, [markers, selectedId]);
  useEffect(() => {
    if (recenterKey > 0) fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey]);

  return <div ref={container} className="absolute inset-0 z-0" data-testid="places-map" />;
};

export default PlacesMap;
