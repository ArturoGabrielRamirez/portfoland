/**
 * Google Maps Configuration
 *
 * Dark/night mode styling for the timeline map.
 */

/**
 * Google Maps API libraries to load
 */
export const MAPS_LIBRARIES: ('places' | 'geometry' | 'drawing' | 'visualization')[] = [
  'places',
];

/**
 * Default map center (Buenos Aires, Argentina)
 */
export const DEFAULT_MAP_CENTER = {
  lat: -34.6037,
  lng: -58.3816,
};

/**
 * Default map zoom level
 */
export const DEFAULT_MAP_ZOOM = 12;

/**
 * Dark mode map styles for gaming aesthetic
 * Based on Snazzy Maps "Dark Matter" style
 */
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0A0E1A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0A0E1A' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A5568' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A5568' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0D1421' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A5568' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0D1421' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3B4A3B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0D1421' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2D3748' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94A3B8' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A5568' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0D1421' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1E293B' }],
  },
];

/**
 * Map options for the timeline view
 */
export const MAP_OPTIONS: google.maps.MapOptions = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
  minZoom: 2,
  maxZoom: 18,
};

/**
 * CSS filter for map when an experience is selected
 * Normal state has no filter - map is clear and visible
 * Focused state dims the map to highlight the selected card
 */
export const MAP_FILTER_NORMAL = 'none';
export const MAP_FILTER_FOCUSED = 'brightness(0.6)';
