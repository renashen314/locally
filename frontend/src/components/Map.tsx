"use client";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Shop } from "@/types/inventory";

export default function Map({ searchResults }: { searchResults: Shop[] }) {
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-73.9235, 40.76], // Astoria, NY
      zoom: 13, // street level
    });

    // Cleanup on unmount
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || searchResults.length === 0) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers for each shop
    searchResults.forEach((shop) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([shop.longitude, shop.latitude])
        .addTo(map.current!);

      // Add a popup to the marker
      const popup = new mapboxgl.Popup().setHTML(`
            <h3 class="font-bold">${shop.name}</h3>
            <p class="text-sm text-gray-600">${shop.address}</p>
          `);
      marker.setPopup(popup);

      // Highlight the shop in the list when the marker is clicked
      marker.getElement().addEventListener("click", () => {
        setSelectedShopId(shop.id);
      });

      markers.current.push(marker);
    });

    // Fit the map to the bounds of all markers
    if (searchResults.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      searchResults.forEach((shop) => {
        bounds.extend([shop.longitude, shop.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [searchResults]);
  // Handle shop selection (from map or list)
  const handleShopSelect = (shopId: number) => {
    setSelectedShopId(shopId);
    // Fly to the selected shop on the map
    const selectedShop = searchResults.find((shop) => shop.id === shopId);
    if (selectedShop && map.current) {
      map.current.flyTo({
        center: [selectedShop.longitude, selectedShop.latitude],
        zoom: 15,
      });
    }
  };
}
