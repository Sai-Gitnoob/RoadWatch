import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function RoadMap() {
  return (
    <MapContainer
      center={[19.0760, 72.8777]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[19.0760, 72.8777]}>
        <Popup>
          Pothole reported here
        </Popup>
      </Marker>
    </MapContainer>
  );
}