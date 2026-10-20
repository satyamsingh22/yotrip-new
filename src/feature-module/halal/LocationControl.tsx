/**
 * Where the page thinks you are, and how to correct it.
 *
 * The wording is deliberate: we say where the estimate came from, because a
 * timezone guess and a shared GPS fix deserve different amounts of trust, and a
 * visitor who can see which one they are getting can decide whether to bother
 * correcting it.
 */

import { useMemo, useState } from "react";
import { searchCities, type City } from "@/utils/prayer/cities";
import type { HalalPlace, LocationSource } from "@/hooks/useHalalLocation";

type Props = {
  place: HalalPlace;
  source: LocationSource;
  isFallback: boolean;
  canUseGps: boolean;
  isLocating: boolean;
  onUseGps: () => void;
  onUseCity: (city: City) => void;
  onReset: () => void;
};

const LocationControl = ({
  place,
  source,
  isFallback,
  canUseGps,
  isLocating,
  onUseGps,
  onUseCity,
  onReset,
}: Props) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => searchCities(query), [query]);

  const choose = (city: City) => {
    onUseCity(city);
    setIsSearching(false);
    setQuery("");
  };

  return (
    <div className="hl-loc">
      <div className="hl-loc-where">
        {source === "gps" ? (
          <span>
            Times for <strong>your exact location</strong>
          </span>
        ) : (
          <span>
            Times for <strong>{place.city}</strong>
            {place.country ? `, ${place.country}` : ""}
            <span className="hl-loc-how">
              {source === "manual" ? " · you chose this" : " · from your timezone"}
            </span>
          </span>
        )}
      </div>

      {isFallback && (
        <p className="hl-loc-warn">
          We couldn&apos;t work out where you are, so these are Makkah&apos;s times. Pick your city
          for times where you actually are.
        </p>
      )}

      <div className="hl-loc-actions">
        {canUseGps && (
          <button type="button" className="hl-chip" onClick={onUseGps} disabled={isLocating}>
            {isLocating ? "Locating…" : "Use my exact location"}
          </button>
        )}

        <button type="button" className="hl-chip" onClick={() => setIsSearching((open) => !open)}>
          Change city
        </button>

        {source !== "timezone" && (
          <button type="button" className="hl-chip hl-chip-quiet" onClick={onReset}>
            Detect automatically
          </button>
        )}
      </div>

      {isSearching && (
        <div className="hl-loc-search">
          <input
            type="text"
            role="combobox"
            aria-label="Search for a city"
            aria-expanded={matches.length > 0}
            aria-controls="hl-city-options"
            autoComplete="off"
            placeholder="Search for a city…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {query.trim() !== "" && matches.length === 0 && (
            <p className="hl-loc-empty">No city matches “{query.trim()}”.</p>
          )}

          {matches.length > 0 && (
            <ul id="hl-city-options" role="listbox" className="hl-loc-options">
              {matches.map((city) => (
                <li key={`${city.city}-${city.country}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => choose(city)}
                  >
                    <span>{city.city}</span>
                    <span className="hl-loc-country">{city.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationControl;
