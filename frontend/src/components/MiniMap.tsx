import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";

function ClickPicker(props: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      props.onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function MiniMap(props: {
  lat: number;
  lon: number;
  onPick: (p: { lat: number; lon: number }) => void;
}) {
  return (
    <div className="h-[160px] overflow-hidden rounded-2xl border border-slate-800/60">
      <MapContainer
        center={[props.lat, props.lon]}
        zoom={2}
        style={{ height: "160px", width: "100%" }}
        scrollWheelZoom={false}
        worldCopyJump
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickPicker onPick={(lat, lon) => props.onPick({ lat, lon })} />
        <CircleMarker center={[props.lat, props.lon]} radius={6} pathOptions={{ color: "#22c55e" }} />
      </MapContainer>
    </div>
  );
}

