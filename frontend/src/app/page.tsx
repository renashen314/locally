'use client';

import { useState, useEffect } from 'react';

interface Store {
  id: string;
  name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state: string;
}

interface StoreItem {
  id: string;
  name: string;
  price: number;
}

export default function Page() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStoreItems = async () => {
      if (!selectedStore) {
        setStoreItems([]);
        return;
      }

      setLoadingItems(true);
      setItemsError(null);

      try {
        const response = await fetch(`http://localhost:8000/api/v0/stores/${selectedStore.id}/items`);
        if (!response.ok) {
          throw new Error('Failed to fetch store items');
        }
        const data = await response.json();
        setStoreItems(data);
      } catch (err) {
        setItemsError(err instanceof Error ? err.message : 'Failed to fetch store items');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchStoreItems();
  }, [selectedStore]);

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
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

      <div className="w-full max-w-6xl flex gap-8">
        <div className="w-1/2">
          {stores.length > 0 && (
            <ul className="space-y-4">
              {stores.map((store) => (
                <li 
                  key={store.id}
                  className={`bg-white text-black shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer
                    ${selectedStore?.id === store.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{store.name}</h2>
                    <p className="text-gray-500 text-sm">
                      {store.street_1}
                      {store.street_2 && `, ${store.street_2}`}
                      {`, ${store.city}, ${store.state}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-1/2">
          {selectedStore && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Items at {selectedStore.name}</h2>
              
              {loadingItems && (
                <div className="text-gray-600">Loading items...</div>
              )}

              {itemsError && (
                <div className="text-red-500 mb-4">
                  Error: {itemsError}
                </div>
              )}

              {!loadingItems && !itemsError && storeItems.length === 0 && (
                <div className="text-gray-600">
                  No items found at this store
                </div>
              )}

              {storeItems.length > 0 && (
                <ul className="space-y-4">
                  {storeItems.map((item) => (
                    <li 
                      key={item.id}
                      className="bg-white text-black shadow rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <p className="text-gray-700">${item.price.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
