import { Shop, InventoryItem } from '@/types/inventory';

// This would typically fetch from your API
export async function getShopsWithInventory(): Promise<Shop[]> {
  // Simulating API call with mock data
  return [
    {
      id: 1,
      name: 'TechHub Singapore',
      business_type: 'Electronics Store',
      latitude: 1.3521,
      longitude: 103.8198,
      address: '123 Orchard Road',
      phone: '+65 6789 0123',
      inventory: [
        {
          id: 1,
          name: 'Smartphone',
          category: 'Electronics',
          quantity: 50,
          price: 999.99,
          description: 'Latest model smartphone'
        },
        {
          id: 2,
          name: 'Laptop',
          category: 'Electronics',
          quantity: 30,
          price: 1299.99,
          description: 'Business laptop'
        },
        // ... more inventory items
      ]
    },
    // ... more shops
  ];
}

export async function searchInventory(searchTerm: string): Promise<Shop[]> {
  const shops = await getShopsWithInventory();
  return shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.inventory.some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
}