'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RiskZone, Village, RoadSegment } from '@/lib/api/types';
import { getRiskColor, getRiskLevel } from '@/lib/utils/riskUtils';

export default function RiskMap({
  zones,
  villages = [],
  roads = [],
  selectedZoneId,
  onSelectZone,
}: {
  zones: RiskZone[];
  villages?: Village[];
  roads?: RoadSegment[];
  selectedZoneId?: string;
  onSelectZone?: (zone: RiskZone) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Center map on North East India (NER)
    const map = L.map(containerRef.current, {
      center: [26.0, 92.5],
      zoom: 7,
      zoomControl: true,
    });

    // Dark carto tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB & OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers & Layers when props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing dynamic layers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Render Road Segments
    roads.forEach((road) => {
      if (road.coordinates && road.coordinates.length > 0) {
        const polyline = L.polyline(road.coordinates, {
          color: road.status === 'BLOCKED' ? '#ef4444' : road.status === 'HIGH_RISK' ? '#f97316' : '#f59e0b',
          weight: 4,
          dashArray: '6, 6',
          opacity: 0.8,
        }).addTo(map);

        polyline.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #f8fafc;">
            <strong style="color: #f59e0b;">${road.name} (${road.highway_code})</strong><br/>
            Status: <span style="color: #ef4444; font-weight: bold;">${road.status}</span><br/>
            Risk Score: ${road.risk_score} / 100<br/>
            Route: ${road.start_point} &rarr; ${road.end_point}
          </div>
        `);
      }
    });

    // Render Villages
    villages.forEach((village) => {
      if (village.coordinates) {
        const marker = L.circleMarker([village.coordinates.lat, village.coordinates.lng], {
          radius: 6,
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc;">
            <strong style="color: #38bdf8;">Village: ${village.name}</strong><br/>
            District: ${village.district}, ${village.state}<br/>
            Population: <strong>${village.population.toLocaleString()}</strong><br/>
            Risk Score: ${village.risk_score} (${village.risk_level})
          </div>
        `);
      }
    });

    // Render Risk Zones
    zones.forEach((zone) => {
      const color = getRiskColor(zone.risk_score);
      const isSelected = selectedZoneId === zone.zone_id;

      // Circle Marker representing Risk Zone
      const circle = L.circleMarker([zone.geometry.lat, zone.geometry.lng], {
        radius: isSelected ? 22 : 16,
        color: isSelected ? '#ffffff' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.85 : 0.65,
        weight: isSelected ? 3 : 2,
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f8fafc; min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #ffffff;">
            ${zone.name}
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px;">
            ${zone.district}, ${zone.state}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #020617; padding: 6px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #1e293b;">
            <span style="font-family: monospace;">Risk Score:</span>
            <span style="font-weight: bold; font-family: monospace; color: ${color}; font-size: 14px;">
              ${zone.risk_score} (${zone.risk_level})
            </span>
          </div>

          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 4px; font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">
            <div>Rainfall: <strong>${zone.rainfall_mm} mm</strong></div>
            <div>Soil Sat: <strong>${zone.soil_moisture}%</strong></div>
            <div>Slope: <strong>${zone.slope_deg}°</strong></div>
            <div>Elevation: <strong>${zone.elevation_m} m</strong></div>
          </div>

          <button
            id="btn-zone-${zone.zone_id}"
            style="width: 100%; background: #f59e0b; color: #020617; font-weight: bold; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 11px;"
          >
            Select Sector for Simulation
          </button>
        </div>
      `;

      circle.bindPopup(popupHtml);

      circle.on('popupopen', () => {
        const btn = document.getElementById(`btn-zone-${zone.zone_id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectZone) onSelectZone(zone);
          };
        }
      });

      circle.on('click', () => {
        if (onSelectZone) onSelectZone(zone);
      });
    });

    // Fly to selected zone if set
    if (selectedZoneId) {
      const active = zones.find((z) => z.zone_id === selectedZoneId);
      if (active) {
        map.flyTo([active.geometry.lat, active.geometry.lng], 9, {
          duration: 1.2,
        });
      }
    }
  }, [zones, villages, roads, selectedZoneId, onSelectZone]);

  return <div ref={containerRef} className="w-full h-full" />;
}
