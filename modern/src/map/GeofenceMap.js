import wellknown from 'wellknown';
import { useEffect, useState } from 'react';

import { map } from './Map';
import { useEffectAsync } from '../reactHelper';
import { reverseCoordinates } from './mapUtil';

const GeofenceMap = () => {
  const id = 'geofences';

  const [geofences, setGeofences] = useState([]);

  useEffectAsync(async () => {
    const response = await fetch('/api/geofences');
    if (response.ok) {
      setGeofences(await response.json());
    }
  }, []);

  useEffect(() => {
    try {
      map.addSource(id, {
        'type': 'geojson',
        'data': {
          type: 'FeatureCollection',
          features: []
        }
      });
    } catch(e) {}

    map.addLayer({
      'source': id,
      'id': 'geofences-fill',
      'type': 'fill',
      'filter': [
         'all',
         ['==', '$type', 'Polygon'],
      ],
      'paint': {
         'fill-color':'#3bb2d0',
         'fill-outline-color':'#3bb2d0',
         'fill-opacity':0.1,
      },
    });
    map.addLayer({
      'source': id,
      'id': 'geofences-line',
      'type': 'line',
      'paint': {
         'line-color': '#3bb2d0',
         'line-width': 2,
      },
    });
    map.addLayer({
      'source': id,
      'id': 'geofences-title',
      'type': 'symbol',
      'layout': {
        'text-field': '{name}',
        'text-font': ['Roboto Regular'],
        'text-size': 12,
      },
      'paint': {
        'text-halo-color': 'white',
        'text-halo-width': 1,
      },
    });

    return () => {
      map.removeLayer('geofences-fill');
      map.removeLayer('geofences-line');
      map.removeLayer('geofences-title');
      try {map.removeSource(id);} catch(e) {}
    };
  }, []);

  useEffect(() => {
    map.getSource(id).setData({
      type: 'FeatureCollection',
      features: geofences.map(item => [item.name, reverseCoordinates(wellknown(item.area))]).filter(([, geometry]) => !!geometry).map(([name, geometry]) => ({
        type: 'Feature',
        geometry: geometry,
        properties: { name },
      })),
    });
  }, [geofences]);

  return null;
}

export default GeofenceMap;
