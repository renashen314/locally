import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addNewItem({
  name,
  categoryName,
  description,
  synonyms,
  shopInventory
}: {
  name: string;
  categoryName: string;
  description: string;
  synonyms: string[];
  shopInventory: Array<{
    shopName: string;
    quantity: number;
    price: number;
  }>;
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');  

    // Ensure category exists
    await client.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [categoryName]
    );

    // Add item
    const itemResult = await client.query(
      `INSERT INTO items (name, category_id, description, synonyms)
       VALUES ($1, (SELECT id FROM categories WHERE name = $2), $3, $4)
       RETURNING id`,
      [name, categoryName, description, synonyms]
    );

    const itemId = itemResult.rows[0].id;

    // Add inventory entries
    for (const inventory of shopInventory) {
      await client.query(
        `INSERT INTO shop_inventory (shop_id, item_id, quantity, price)
         VALUES (
           (SELECT id FROM shops WHERE name = $1),
           $2,
           $3,
           $4
         )`,
        [inventory.shopName, itemId, inventory.quantity, inventory.price]
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}