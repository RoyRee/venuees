"use client";
import { useCity } from "./city-context";

export function CityName() {
  const { city } = useCity();
  return <>{city.name}</>;
}
