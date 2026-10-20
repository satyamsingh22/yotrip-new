import React, { useMemo } from "react";
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import { lookupAirportByIata } from "@/utils/airports";

const MAPS_KEY = "AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I";

const containerStyle = { width: "100%", height: "220px" };

const coordsFor = (iata: string) => {
  const airport = lookupAirportByIata(iata?.trim?.() ?? "");
  if (airport?.latitude == null || airport?.longitude == null) return null;
  const lat = Number(airport.latitude);
  const lng = Number(airport.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

type FlightRouteMapProps = {
  origin: string;
  destination: string;
  durationLabel?: string;
};

const FlightRouteMap: React.FC<FlightRouteMapProps> = ({
  origin,
  destination,
  durationLabel,
}) => {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: MAPS_KEY });

  const { originPt, destPt, center, path } = useMemo(() => {
    const originPt = coordsFor(origin);
    const destPt = coordsFor(destination);
    if (!originPt || !destPt) {
      return { originPt: null, destPt: null, center: { lat: 20, lng: 0 }, path: [] };
    }
    return {
      originPt,
      destPt,
      center: {
        lat: (originPt.lat + destPt.lat) / 2,
        lng: (originPt.lng + destPt.lng) / 2,
      },
      path: [originPt, destPt],
    };
  }, [origin, destination]);

  if (loadError || !originPt || !destPt) {
    return (
      <div className="yt-flight-route-map yt-flight-route-map--fallback" aria-hidden>
        <div className="yt-flight-route-map__fallback-inner">
          <span className="yt-flight-route-map__code">{origin}</span>
          <span className="yt-flight-route-map__arc">
            {durationLabel ? durationLabel : "—"}
          </span>
          <span className="yt-flight-route-map__code">{destination}</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="yt-flight-route-map yt-flight-route-map--loading" />;
  }

  return (
    <div className="yt-flight-route-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4}
        options={{
          scrollwheel: false,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        <Polyline
          path={path}
          options={{
            strokeColor: "#2563eb",
            strokeOpacity: 0.85,
            strokeWeight: 3,
            geodesic: true,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  scale: 3,
                },
                offset: "0",
                repeat: "12px",
              },
            ],
          }}
        />
        <Marker position={originPt} label={{ text: origin, color: "#101828", fontSize: "11px" }} />
        <Marker position={destPt} label={{ text: destination, color: "#101828", fontSize: "11px" }} />
      </GoogleMap>
    </div>
  );
};

export default FlightRouteMap;
