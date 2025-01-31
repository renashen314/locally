'use client';
import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface LocationSearchProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    const searchLocation = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchText
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=SG`
        );
        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSuggestionClick = (suggestion: any) => {
    const [longitude, latitude] = suggestion.center;
    onLocationSelect({
      latitude,
      longitude,
      address: suggestion.place_name
    });
    setSearchText(suggestion.place_name);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search location..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {suggestion.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}