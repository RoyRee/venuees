"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type City = { id: number; name: string; slug: string; lat: number; lng: number };

const CACHE_KEY = "venuees_city_v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h

interface CityCtx { city: City; setCity: (c: City) => void; allCities: City[] }

const CityContext = createContext<CityCtx>({
  city: { id: 1, name: "Nagpur", slug: "nagpur", lat: 21.1458, lng: 79.0882 },
  setCity: () => {},
  allCities: [],
});

// Haversine distance in km
function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearest(cities: City[], lat: number, lng: number): City {
  return cities.reduce((best, c) =>
    distKm(lat, lng, c.lat, c.lng) < distKm(lat, lng, best.lat, best.lng) ? c : best
  , cities[0]);
}

export function CityProvider({ children, cities }: { children: React.ReactNode; cities: City[] }) {
  const defaultCity = cities[0] ?? { id: 1, name: "Nagpur", slug: "nagpur", lat: 21.1458, lng: 79.0882 };
  const [city, setCity] = useState<City>(defaultCity);

  useEffect(() => {
    if (cities.length === 0) return;

    // 1. Try localStorage cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { id, ts } = JSON.parse(raw) as { id: number; ts: number };
        if (Date.now() - ts < CACHE_TTL) {
          const cached = cities.find((c) => c.id === id);
          if (cached) { setCity(cached); return; }
        }
      }
    } catch { /* ignore */ }

    // 2. Geolocation
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const found = nearest(cities, latitude, longitude);
        setCity(found);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ id: found.id, ts: Date.now() })); } catch { /* ignore */ }
      },
      () => { /* permission denied — keep default */ },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [cities]);

  function handleSetCity(c: City) {
    setCity(c);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ id: c.id, ts: Date.now() })); } catch { /* ignore */ }
  }

  return (
    <CityContext.Provider value={{ city, setCity: handleSetCity, allCities: cities }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
