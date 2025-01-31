import { NextResponse } from "next/server";
import { Pool } from "pg";
import axios from "axios";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function geocodeAddress(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { features } = response.data;

    if (features.length > 0) {
      const [longitude, latitude] = features[0].center;
      return { latitude, longitude };
    }
    throw new Error("No results found for the address");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Failed to geocode address");
  }
}

export async function POST(request: Request) {
  try {
    const { itemName, userAddress, radius = 1 } = await request.json();

    if (!itemName || !userAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: itemName or address" },
        { status: 400 }
      );
    }

    const { latitude, longitude } = await geocodeAddress(userAddress);
    const radiusInMeters = radius * 1000;

    const query = `
      SELECT 
        s.id,
        s.name,
        s.business_type,
        s.address,
        s.phone,
        ST_X(s.location::geometry) as longitude,
        ST_Y(s.location::geometry) as latitude,
        ST_Distance(s.location::geography, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography) as distance,
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
        (i.name ILIKE $1 
    OR i.description ILIKE $1
    OR $1 = ANY(i.synonyms))
        AND si.quantity > 0
        AND ST_DWithin(
          s.location::geography,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
          $4
        )
      GROUP BY s.id
      ORDER BY distance
      LIMIT 10;
    `;

    const result = await pool.query(query, [
      `%${itemName}%`,
      Number(longitude),
      Number(latitude),
      Number(radiusInMeters),
    ]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
