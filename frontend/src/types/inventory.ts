export interface Shop {
    id: number;
    name: string;
    business_type: string;
    latitude?: number;
    longitude?: number;
    address: string;
    phone: string;
    inventory: InventoryItem[];
}

export interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    price: number;
    description: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface SearchFormProps {
    onSearch: (searchParams: SearchParams) => void;
}
  
export interface SearchParams {
    itemName: string;
    userAddress: string;
    radius: number; // in kilometers
}
  