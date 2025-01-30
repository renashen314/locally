'use client';

import { useState, useEffect } from 'react';

interface Store {
  id: string;
  name: string;
  address: string;
}

export default function Page() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v0/stores');
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await response.json();
        setStores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">localmart</h1>
      </div>

      <h1 className="text-3xl font-bold mb-8 mt-16">Stores</h1>
      
      {loading && (
        <div className="text-gray-600">Loading stores...</div>
      )}

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <div className="text-gray-600">
          No stores found
        </div>
      )}

      {stores.length > 0 && (
        <ul className="w-full max-w-2xl space-y-4">
          {stores.map((store) => (
            <li 
              key={store.id}
              className="bg-white text-black shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-gray-600 mt-2">{store.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
