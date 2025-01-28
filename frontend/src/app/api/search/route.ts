import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json();

    // Convert radius from kilometers to meters
    // const radiusInMeters = radius * 1000;

    const query = `
      SELECT 
        s.id,
        s.name,
        s.business_type,
        s.address,
        s.phone,
        json_agg(json_build_object(
          'id', i.id,
          'name', i.name,
          'category', c.name,
          'quantity', si.quantity,
          'price', si.price
        )) as inventory
      FROM items i
      JOIN shop_inventory si ON i.id = si.item_id
      JOIN shops s ON s.id = si.shop_id
      JOIN categories c ON i.category_id = c.id
      WHERE 
        i.name ILIKE $1 
        AND si.quantity > 0
      GROUP BY s.id
    `;

    const result = await pool.query(query, [`%${itemName}%`]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}