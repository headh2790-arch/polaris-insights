import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, ZoomControl } from "react-leaflet";
import type { Layer, LeafletMouseEvent, Map as LeafletMap, PathOptions } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";
import type { StatePrediction } from "@/types/polaris";
import { ErrorBlock, LoadingBlock } from "./primitives";

interface StateProps {
  name: string;
}

type StateCollection = FeatureCollection<Geometry, StateProps>;

const RAMP = [
  "oklch(0.30 0.045 235)",
  "oklch(0.42 0.075 225)",
  "oklch(0.53 0.10 210)",
  "oklch(0.65 0.125 200)",
  "oklch(0.79 0.14 195)",
] as const;

function colorFor(value: number | null, min: number, max: number): string {
  if (value === null) return "oklch(0.26 0.026 253)";
  if (max <= min) return RAMP[2]!;
  const t = (value - min) / (max - min);
  const idx = Math.min(RAMP.length - 1, Math.max(0, Math.floor(t * RAMP.length)));
  return RAMP[idx]!;
}

export interface IndiaMapClientProps {
  predictions: StatePrediction[];
  unit: string;
  selectedState: string | null;
  onSelectState: (state: string) => void;
  quantitative: boolean;
}

export default function IndiaMapClient({
  predictions,
  unit,
  selectedState,
  onSelectState,
  quantitative,
}: IndiaMapClientProps) {
  const [geo, setGeo] = useState<StateCollection | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/india-states.json")
      .then((r) => {
        if (!r.ok) throw new Error("geo fetch failed");
        return r.json() as Promise<StateCollection>;
      })
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byState = useMemo(() => {
    const m = new Map<string, StatePrediction>();
    for (const p of predictions) m.set(p.state, p);
    return m;
  }, [predictions]);

  const { min, max } = useMemo(() => {
    const vals = predictions.map((p) => p.effect).filter((v): v is number => v !== null);
    return vals.length
      ? { min: Math.min(...vals), max: Math.max(...vals) }
      : { min: 0, max: 0 };
  }, [predictions]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return predictions
      .map((p) => p.state)
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, predictions]);

  const style = (feature?: Feature<Geometry, StateProps>): PathOptions => {
    const name = feature?.properties.name ?? "";
    const pred = byState.get(name);
    const isActive = name === selectedState;
    const isHover = name === hovered;
    return {
      fillColor: colorFor(pred?.effect ?? null, min, max),
      fillOpacity: isActive ? 0.96 : isHover ? 0.85 : 0.66,
      color: isActive ? "oklch(0.95 0.008 240)" : "oklch(0.55 0.03 245 / 70%)",
      weight: isActive ? 2 : isHover ? 1.4 : 0.7,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, StateProps>, layer: Layer) => {
    const name = feature.properties.name;
    layer.on({
      mouseover: () => setHovered(name),
      mouseout: () => setHovered((h) => (h === name ? null : h)),
      click: () => onSelectState(name),
      keydown: (e: LeafletMouseEvent & { originalEvent: KeyboardEvent }) => {
        if (e.originalEvent.key === "Enter") onSelectState(name);
      },
    });
  };

  const focusState = (name: string) => {
    onSelectState(name);
    setSearch("");
    const map = mapRef.current;
    if (!map || !geo) return;
    const feature = geo.features.find((f) => f.properties.name === name);
    if (!feature) return;
    import("leaflet").then((L) => {
      const bounds = L.geoJSON(feature as never).getBounds();
      map.fitBounds(bounds, { padding: [40, 40] });
    });
  };

  const hoveredPred = hovered ? byState.get(hovered) : undefined;

  if (failed) return <ErrorBlock message="The India state map could not be loaded." />;
  if (!geo) return <LoadingBlock label="Loading India state geometry" rows={4} />;

  return (
    <div className="relative">
      <div className="absolute left-3 top-3 z-[500] w-56">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised/95 px-3 py-2 backdrop-blur">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state"
            aria-label="Search state"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        {matches.length > 0 && (
          <ul className="mt-1 overflow-hidden rounded-lg border border-border bg-popover/98 backdrop-blur">
            {matches.map((m) => (
              <li key={m}>
                <button
                  onClick={() => focusState(m)}
                  className="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                >
                  {m}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hoveredPred && (
        <div className="pointer-events-none absolute right-3 top-3 z-[500] w-56 rounded-lg border border-border bg-popover/95 p-3 backdrop-blur">
          <p className="text-sm font-medium text-foreground">{hoveredPred.state}</p>
          {hoveredPred.effect === null ? (
            <p className="mt-1 text-xs text-muted-foreground">No quantitative estimate</p>
          ) : (
            <p className="num mt-1 text-sm text-primary">
              {hoveredPred.effect > 0 ? "+" : ""}
              {hoveredPred.effect} {unit}
            </p>
          )}
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={[22.6, 80]}
        zoom={4}
        minZoom={3}
        maxZoom={8}
        zoomControl={false}
        scrollWheelZoom
        attributionControl={false}
        style={{ height: "clamp(380px, 58vh, 620px)", width: "100%" }}
      >
        <ZoomControl position="bottomright" />
        <GeoJSON
          key={`${selectedState ?? "none"}-${hovered ?? "none"}-${min}-${max}`}
          data={geo}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="label-eyebrow">
            {quantitative ? `Predicted effect (${unit})` : "No model coverage"}
          </span>
          <div className="flex overflow-hidden rounded-md border border-border">
            {RAMP.map((c) => (
              <span key={c} className="h-3 w-8" style={{ backgroundColor: c }} />
            ))}
          </div>
          {quantitative && (
            <span className="num text-xs text-muted-foreground">
              {min.toFixed(2)} → {max.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Hover a state for the estimate, click to open the state detail panel.
        </p>
      </div>
    </div>
  );
}
