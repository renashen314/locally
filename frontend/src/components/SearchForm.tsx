'use client';
import { useState } from 'react';
import { SearchFormProps } from '@/types/inventory';

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [itemName, setItemName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      onSearch({
        itemName,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Item Name</label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter item name..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}