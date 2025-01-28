'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Shop } from '@/types/inventory';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface InventoryMapProps {
  shops: Shop[];
}

export default function InventoryMap({ shops }: InventoryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [103.8198, 1.3521], // Singapore coordinates
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each shop
    shops.forEach((shop) => {
      const inventoryCount = shop.inventory.reduce((sum, item) => sum + item.quantity, 0);
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${shop.name}</h3>
          <p class="text-sm">${shop.business_type}</p>
          <p class="text-sm">${shop.address}</p>
          <p class="text-sm">Total Items: ${inventoryCount}</p>
        </div>
      `);

      new mapboxgl.Marker()
        .setLngLat([shop.longitude, shop.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [shops]);

  return (
    <div ref={mapContainer} className="w-full h-[400px] rounded-lg" />
  );
} 