-- First, enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Alter shops table to add a geometry column
ALTER TABLE shops ADD COLUMN location geometry(POINT, 4326);

-- Update existing coordinates to geometry format
UPDATE shops 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Create spatial index
CREATE INDEX idx_shops_location ON shops USING GIST(location);

-- Optional: Add constraint to ensure location is always a point
ALTER TABLE shops 
ADD CONSTRAINT enforce_geometry_type 
CHECK (ST_GeometryType(location) = 'ST_Point'); 