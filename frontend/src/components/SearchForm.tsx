"use client";
import { useState } from "react";
import { SearchFormProps } from "@/types/inventory";

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [itemName, setItemName] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [radius, setRadius] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      await onSearch({
        itemName,
        userAddress,
        radius,
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Item Name
        </label>
        <input
          type="text"
          value={itemName}
          name="item"
          onChange={(e) => setItemName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter item name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your Address
        </label>
        <input
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter your address"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Search Radius (km):{" "}
          <span className="px-2 text-lg text-blue-500">{radius}</span>
        </label>
        <input
          type="range"
          value={radius}
          name="radius"
          onChange={(e) => setRadius(Number(e.target.value))}
          className="mt-1 block h-4 w-full accent-blue-500 cursor-pointer"
          min="1"
          max="10"
          step="1"
          required
        />
        <div className="flex justify-between text-md text-gray-500 mt-1">
          <span>1km</span>
          <span>10km</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSearching ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
