'use client';

/**
 * LocationPicker Component
 *
 * Google Places autocomplete with map for selecting locations.
 * Returns coordinates and formatted address.
 */

import { memo, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Autocomplete } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/features/shadcn/ui/input';
import type { LocationPickerProps } from '../types/experience';
import {
  MAPS_LIBRARIES,
  DEFAULT_MAP_CENTER,
  DARK_MAP_STYLES,
} from '../config/maps';

/**
 * Container style for the mini map
 */
const containerStyle = {
  width: '100%',
  height: '200px',
};

/**
 * Map options for the location picker
 */
const mapOptions: google.maps.MapOptions = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

/**
 * LocationPicker allows users to select a location via search or map click
 */
function LocationPickerComponent({ value, onChange, className }: LocationPickerProps) {
  const [searchValue, setSearchValue] = useState(value?.address || '');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAPS_LIBRARIES,
  });

  // Handle autocomplete load
  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  // Handle place selection from autocomplete
  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name || '';

      setSearchValue(address);
      onChange({
        latitude: lat,
        longitude: lng,
        address,
      });

      // Pan map to selected location
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    }
  }, [onChange]);

  // Handle map click for manual selection
  const onMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();

      try {
        const result = await geocoder.geocode({ location: { lat, lng } });

        if (result.results[0]) {
          const address = result.results[0].formatted_address;
          setSearchValue(address);
          onChange({
            latitude: lat,
            longitude: lng,
            address,
          });
        } else {
          onChange({
            latitude: lat,
            longitude: lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      } catch {
        onChange({
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    },
    [onChange]
  );

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  if (loadError) {
    return (
      <div className={cn('p-4 bg-red-500/10 border border-red-500/20 rounded-lg', className)}>
        <p className="text-red-400 text-sm">Error loading location picker</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn('p-4 bg-slate-800 rounded-lg animate-pulse', className)}>
        <div className="h-10 bg-slate-700 rounded mb-2" />
        <div className="h-[200px] bg-slate-700 rounded" />
      </div>
    );
  }

  const markerPosition = value
    ? { lat: value.latitude, lng: value.longitude }
    : null;

  const mapCenter = markerPosition || DEFAULT_MAP_CENTER;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search input with autocomplete */}
      <div className="relative">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['establishment', 'geocode'],
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Mini map for visual selection */}
      <div className="relative rounded-lg overflow-hidden border border-slate-700">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={value ? 15 : 10}
          options={mapOptions}
          onClick={onMapClick}
          onLoad={onMapLoad}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#00D4FF',
                fillOpacity: 1,
                strokeColor: '#00D4FF',
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>

        {/* Click hint overlay */}
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 pointer-events-none">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Click on the map or search above</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected location display */}
      {value && (
        <div className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-lg">
          <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-white">{value.address}</p>
            <p className="text-slate-500 text-xs">
              {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const LocationPicker = memo(LocationPickerComponent);
