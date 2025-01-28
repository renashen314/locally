"use client";
import { useState } from "react";
import { Shop, SearchParams } from "@/types/inventory";
import SearchForm from "@/components/SearchForm";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchParams: SearchParams) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Find items locally</h1>
      <div className="grid grid-cols-1 gap-8">
        <SearchForm onSearch={handleSearch} />
        
        {isLoading ? (
          <div className="text-center">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((shop) => (
              <div key={shop.id} className="bg-white p-4 rounded-lg shadow">
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
          <div className="text-center text-gray-600">
            No results found
          </div>
        )}
      </div>
    </main>
  );
}
