-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Groceries', 'Food and household items'),
('Clothing', 'Apparel and accessories'),
('Hardware', 'Tools and building materials'),
('Sporting Goods', 'Sports equipment and gear');

-- Insert Shops (Using Singapore area coordinates as example)
INSERT INTO shops (name, business_type, latitude, longitude, address, phone) VALUES
('TechHub Singapore', 'Electronics Store', 1.3521, 103.8198, '123 Orchard Road', '+65 6789 0123'),
('Fresh Mart', 'Supermarket', 1.3544, 103.8686, '456 Marina Bay Drive', '+65 6789 0124'),
('Sports Central', 'Sporting Goods', 1.3038, 103.8328, '789 Harbourfront Walk', '+65 6789 0125'),
('Fashion Forward', 'Clothing Store', 1.3018, 103.8417, '321 Sentosa Gateway', '+65 6789 0126'),
('Hardware Plus', 'Hardware Store', 1.3187, 103.8418, '654 Queensway Drive', '+65 6789 0127');

-- Insert Items
INSERT INTO items (name, category_id, description) VALUES
-- Electronics
('Smartphone', 1, 'Latest model smartphone'),
('Laptop', 1, 'Business laptop'),
('Headphones', 1, 'Wireless headphones'),
-- Groceries
('Rice (5kg)', 2, 'Premium jasmine rice'),
('Milk (1L)', 2, 'Fresh whole milk'),
('Bread', 2, 'Whole wheat bread'),
-- Clothing
('T-Shirt', 3, 'Cotton crew neck'),
('Jeans', 3, 'Classic fit denim'),
('Sneakers', 3, 'Athletic shoes'),
-- Hardware
('Hammer', 4, 'Claw hammer'),
('Screwdriver Set', 4, 'Multi-piece set'),
('Power Drill', 4, 'Cordless drill'),
-- Sporting Goods
('Basketball', 5, 'Official size'),
('Yoga Mat', 5, 'Premium thickness'),
('Tennis Racket', 5, 'Professional grade');

-- Insert Shop Inventory
INSERT INTO shop_inventory (shop_id, item_id, quantity, price) VALUES
-- TechHub inventory
(1, 1, 50, 999.99),  -- Smartphones
(1, 2, 30, 1299.99), -- Laptops
(1, 3, 100, 199.99), -- Headphones

-- Fresh Mart inventory
(2, 4, 200, 15.99),  -- Rice
(2, 5, 150, 3.99),   -- Milk
(2, 6, 100, 2.99),   -- Bread

-- Sports Central inventory
(3, 13, 50, 29.99),  -- Basketball
(3, 14, 75, 39.99),  -- Yoga Mat
(3, 15, 25, 159.99), -- Tennis Racket

-- Fashion Forward inventory
(4, 7, 200, 24.99),  -- T-Shirt
(4, 8, 150, 79.99),  -- Jeans
(4, 9, 100, 89.99),  -- Sneakers

-- Hardware Plus inventory
(5, 10, 50, 19.99),  -- Hammer
(5, 11, 30, 29.99),  -- Screwdriver Set
(5, 12, 25, 149.99); -- Power Drill 