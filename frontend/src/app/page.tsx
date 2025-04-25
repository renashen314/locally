"use client";
import { useState, useEffect, useRef } from "react";
import { Shop, SearchParams } from "@/types/inventory";
import SearchForm from "@/components/SearchForm";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  // Initialize the map
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

  // Update map markers when search results change
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

  const handleSearch = async ({
    itemName,
    userAddress,
    radius,
  }: SearchParams) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemName, userAddress, radius }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Search failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      setSearchResults(data);
      setSelectedShopId(null);
    } catch (error) {
      console.error("Search error:", error);
      alert(error.message || "Failed to perform search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
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

  return (
    <main className="p-16">
      <h1 className="text-2xl font-bold mb-6">Find waht you need, locally</h1>
      {/* Left Column: Search Form and Results List */}
      <div className="flex flex-col gap-8">
      <SearchForm onSearch={handleSearch} />
        <div className="flex gap-8">
        {isLoading ? (
          <div className="text-center flex-1">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4 flex-1">
            {searchResults.map((shop) => (
              <div
                key={shop.id}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer ${
                  selectedShopId === shop.id ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => handleShopSelect(shop.id)}
              >
                <h3 className="font-bold">{shop.name}</h3>
                <p className="text-sm text-gray-600">{shop.business_type}</p>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <div className="mt-2">
                  <h4 className="font-semibold">Available Items:</h4>
                  <ul className="text-sm">
                    {shop.inventory.map((item) => (
                      <li key={item.id}>
                        {item.name} - ${item.price} ({item.quantity} in stock)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center justify-center items-center text-gray-600 flex-1 bg-white p-4 rounded-lg shadow">No results found</div>
        )}
        {/* Right Column: Map */}
        <div className="h-[600px] rounded-lg flex-1">
          <div ref={mapContainer} className="h-full" />
        </div>
        </div>

      </div>
    </main>
  );
}
