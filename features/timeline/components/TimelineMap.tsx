'use client';

/**
 * TimelineMap Component
 *
 * Google Maps integration with hexagon nodes for experiences.
 * Features dark styling, blur effect, and animated transitions.
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import type { TimelineMapProps } from '../types/experience';
import type { Experience } from '../types/experience';
import {
  MAPS_LIBRARIES,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_OPTIONS,
  MAP_FILTER_NORMAL,
  MAP_FILTER_FOCUSED,
} from '../config/maps';
import { HexagonNode } from './HexagonNode';
import { ExperienceCard } from './ExperienceCard';
import { TimelineConnections } from './TimelineConnections';

/**
 * Container style for the map
 */
const containerStyle = {
  width: '100%',
  height: '100%',
};

/**
 * TimelineMap renders experiences on a Google Map
 */
function TimelineMapComponent({
  experiences,
  selectedExperience,
  onExperienceSelect,
  isEditable = false,
  className,
}: TimelineMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAPS_LIBRARIES,
  });

  // Calculate initial bounds to fit all experiences
  // Note: bounds is calculated in onMapLoad since google API must be loaded first
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

  // Handle map load
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Calculate bounds and fit if we have experiences
      if (experiences.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        experiences.forEach((exp) => {
          bounds.extend({ lat: exp.latitude, lng: exp.longitude });
        });
        boundsRef.current = bounds;

        if (experiences.length > 1) {
          map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
        }
      }
    },
    [experiences]
  );

  // Handle experience selection
  const handleExperienceClick = useCallback(
    (experience: Experience) => {
      onExperienceSelect?.(experience);

      // Animate to selected experience
      if (mapRef.current) {
        mapRef.current.panTo({ lat: experience.latitude, lng: experience.longitude });
        mapRef.current.setZoom(14);
      }
    },
    [onExperienceSelect]
  );

  // Handle card close
  const handleCardClose = useCallback(() => {
    onExperienceSelect?.(null as unknown as Experience);

    // Reset to fit all bounds
    if (mapRef.current && boundsRef.current) {
      mapRef.current.fitBounds(boundsRef.current);
    }
  }, [onExperienceSelect]);

  // Update node positions for connections
  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodePositions((prev) => {
      const next = new Map(prev);
      next.set(id, { x, y });
      return next;
    });
  }, []);

  // Check for current experience (no end date)
  const isCurrentExperience = useCallback((exp: Experience) => {
    return !exp.endDate;
  }, []);

  if (loadError) {
    return (
      <div className={cn('flex items-center justify-center bg-[#0A0E1A]', className)}>
        <p className="text-red-400">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn('flex items-center justify-center bg-[#0A0E1A]', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Map with blur filter */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          filter: selectedExperience ? MAP_FILTER_FOCUSED : MAP_FILTER_NORMAL,
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          options={MAP_OPTIONS}
          onLoad={onMapLoad}
        >
          {/* Hexagon nodes */}
          {experiences.map((experience) => (
            <OverlayView
              key={experience.id}
              position={{ lat: experience.latitude, lng: experience.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <HexagonNode
                experience={experience}
                isSelected={selectedExperience?.id === experience.id}
                isCurrent={isCurrentExperience(experience)}
                onClick={handleExperienceClick}
              />
            </OverlayView>
          ))}
        </GoogleMap>
      </div>

      {/* Timeline connections overlay */}
      <TimelineConnections experiences={experiences} positions={nodePositions} />

      {/* Experience card overlay */}
      {selectedExperience && (
        <div className="absolute top-4 right-4 z-10">
          <ExperienceCard
            experience={selectedExperience}
            isEditable={isEditable}
            onClose={handleCardClose}
          />
        </div>
      )}

      {/* Empty state */}
      {experiences.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-2">No experiences yet</p>
            <p className="text-slate-500 text-sm">
              Add your first experience to start building your timeline
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const TimelineMap = memo(TimelineMapComponent);
