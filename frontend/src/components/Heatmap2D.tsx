import Plot from "react-plotly.js";
import { useMemo } from "react";

export function Heatmap2D(props: {
  mapData: any;
  onPickLocation: (p: { lat: number; lon: number }) => void;
}) {
  const { lat, lon, z } = props.mapData ?? {};
  const ready = Array.isArray(lat) && Array.isArray(lon) && Array.isArray(z);

  const title = useMemo(() => {
    if (!props.mapData) return "Global 2D Map";
    const name = props.mapData.long_name || props.mapData.variable || "Field";
    const units = props.mapData.units ? ` (${props.mapData.units})` : "";
    return `${name}${units}`;
  }, [props.mapData]);

  const { scatterLat, scatterLon, scatterZ } = useMemo(() => {
    if (!ready || !Array.isArray(lat) || !Array.isArray(lon) || !Array.isArray(z)) return { scatterLat: [], scatterLon: [], scatterZ: [] };
    const lats: number[] = [];
    const lons: number[] = [];
    const vals: number[] = [];
    const latArr = lat as number[];
    const lonArr = lon as number[];
    const zArr = z as number[][];
    for (let i = 0; i < latArr.length; i++) {
      for (let j = 0; j < lonArr.length; j++) {
        const v = zArr[i]?.[j];
        if (v != null && Number.isFinite(v)) {
          lats.push(latArr[i]);
          lons.push(lonArr[j]);
          vals.push(v);
        }
      }
    }
    return { scatterLat: lats, scatterLon: lons, scatterZ: vals };
  }, [ready, lat, lon, z]);

  const useGeo = ready && scatterLat.length > 0 && scatterLat.length <= 15000;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-700/50 px-4 py-2">
        <span className="text-sm font-semibold text-slate-200">{title}</span>
        <span className="text-[10px] text-slate-500">Click to set location</span>
      </div>
      <div className="min-h-0 flex-1">
        {ready ? (
          useGeo ? (
            <Plot
              data={[
                {
                  type: "scattergeo",
                  lat: scatterLat,
                  lon: scatterLon,
                  mode: "markers",
                  marker: {
                    size: 4,
                    color: scatterZ,
                    colorscale: "Turbo",
                    cmin: Math.min(...scatterZ),
                    cmax: Math.max(...scatterZ),
                    opacity: 0.85,
                    line: { width: 0 },
                  },
                  name: "",
                } as any
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                geo: {
                  showland: true,
                  showcountries: true,
                  showocean: true,
                  landcolor: "rgb(30, 41, 59)",
                  oceancolor: "rgb(15, 23, 42)",
                  countrycolor: "rgba(148, 163, 184, 0.4)",
                  coastlinecolor: "rgba(148, 163, 184, 0.5)",
                  projection: { type: "natural earth" },
                  lonaxis: { range: [-180, 180] },
                  lataxis: { range: [-90, 90] },
                },
                margin: { l: 0, r: 0, t: 8, b: 0 },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
              onClick={(ev: any) => {
                const p = ev?.points?.[0];
                const latV = p?.lat;
                const lonV = p?.lon;
                if (typeof latV === "number" && typeof lonV === "number") {
                  props.onPickLocation({ lat: latV, lon: lonV });
                }
              }}
            />
          ) : (
            <Plot
              data={[
                {
                  type: "heatmap",
                  z,
                  x: lon,
                  y: lat,
                  colorscale: "Turbo",
                  hoverongaps: false,
                  zsmooth: "best",
                } as any
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                margin: { l: 46, r: 16, t: 8, b: 38 },
                xaxis: { title: "Lon", gridcolor: "rgba(148,163,184,0.12)" },
                yaxis: { title: "Lat", gridcolor: "rgba(148,163,184,0.12)" },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
              onClick={(ev: any) => {
                const p = ev?.points?.[0];
                const lonV = p?.x;
                const latV = p?.y;
                if (typeof latV === "number" && typeof lonV === "number") {
                  props.onPickLocation({ lat: latV, lon: lonV });
                }
              }}
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
            Upload a dataset to see the map.
          </div>
        )}
      </div>
    </div>
  );
}
