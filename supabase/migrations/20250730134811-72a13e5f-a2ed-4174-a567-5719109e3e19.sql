-- Insert sample trip logs for Q2 2024 (April, May, June) for a customer with 3 trucks
INSERT INTO trip_logs (user_id, date, start_location, end_location, miles, purpose, notes, vehicle_id) VALUES
-- Truck 1 trips (April)
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-05', 'Los Angeles, CA', 'Phoenix, AZ', 372.5, 'business', 'Delivery run', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-08', 'Phoenix, AZ', 'Denver, CO', 602.1, 'business', 'Long haul', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-12', 'Denver, CO', 'Kansas City, MO', 557.8, 'business', 'Cross-country', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-15', 'Kansas City, MO', 'Chicago, IL', 525.3, 'business', 'Midwest route', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-20', 'Chicago, IL', 'Detroit, MI', 283.7, 'business', 'Short haul', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-25', 'Detroit, MI', 'Cleveland, OH', 169.2, 'business', 'Regional delivery', gen_random_uuid()),

-- Truck 2 trips (May)
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-03', 'Houston, TX', 'Dallas, TX', 239.4, 'business', 'Texas route', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-07', 'Dallas, TX', 'Oklahoma City, OK', 206.8, 'business', 'Oklahoma delivery', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-10', 'Oklahoma City, OK', 'Little Rock, AR', 342.1, 'business', 'Arkansas run', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-15', 'Little Rock, AR', 'Memphis, TN', 133.5, 'business', 'Short trip', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-18', 'Memphis, TN', 'Nashville, TN', 210.7, 'business', 'Tennessee route', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-22', 'Nashville, TN', 'Atlanta, GA', 249.8, 'business', 'Georgia delivery', gen_random_uuid()),

-- Truck 3 trips (June)
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-02', 'Miami, FL', 'Tampa, FL', 279.3, 'business', 'Florida route', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-05', 'Tampa, FL', 'Jacksonville, FL', 200.1, 'business', 'North Florida', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-08', 'Jacksonville, FL', 'Savannah, GA', 139.7, 'business', 'Georgia border', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-12', 'Savannah, GA', 'Columbia, SC', 130.2, 'business', 'South Carolina', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-16', 'Columbia, SC', 'Charlotte, NC', 92.8, 'business', 'North Carolina', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-20', 'Charlotte, NC', 'Raleigh, NC', 165.4, 'business', 'State capital', gen_random_uuid()),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-25', 'Raleigh, NC', 'Virginia Beach, VA', 184.9, 'business', 'Virginia delivery', gen_random_uuid());

-- Insert sample fuel receipts for Q2 2024
INSERT INTO receipts (user_id, receipt_date, vendor, location, state_code, gallons, price_per_gallon, total_amount, fuel_tax) VALUES
-- April receipts
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-05', 'Shell', 'Los Angeles, CA', 'CA', 45.2, 4.89, 221.03, 24.39),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-08', 'Pilot', 'Phoenix, AZ', 'AZ', 52.7, 4.65, 245.06, 26.44),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-12', 'Flying J', 'Denver, CO', 'CO', 48.9, 4.72, 230.81, 24.45),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-15', 'TA', 'Kansas City, MO', 'MO', 51.3, 4.58, 234.95, 25.65),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-20', 'Speedway', 'Chicago, IL', 'IL', 46.8, 4.83, 226.04, 23.40),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-04-25', 'Marathon', 'Detroit, MI', 'MI', 43.2, 4.76, 205.63, 21.60),

-- May receipts
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-03', 'Exxon', 'Houston, TX', 'TX', 49.6, 4.42, 219.23, 24.80),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-07', 'Valero', 'Dallas, TX', 'TX', 47.3, 4.38, 207.17, 23.65),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-10', 'Conoco', 'Oklahoma City, OK', 'OK', 44.7, 4.51, 201.60, 22.35),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-15', 'Phillips 66', 'Little Rock, AR', 'AR', 41.9, 4.46, 186.87, 20.95),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-18', 'Shell', 'Memphis, TN', 'TN', 45.8, 4.52, 207.02, 22.90),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-05-22', 'BP', 'Nashville, TN', 'TN', 50.2, 4.49, 225.40, 25.10),

-- June receipts
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-02', 'Wawa', 'Miami, FL', 'FL', 53.1, 4.33, 229.92, 26.55),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-05', 'Circle K', 'Tampa, FL', 'FL', 48.4, 4.31, 208.60, 24.20),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-08', 'RaceTrac', 'Jacksonville, FL', 'FL', 42.6, 4.29, 182.75, 21.30),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-12', 'Shell', 'Savannah, GA', 'GA', 39.8, 4.41, 175.52, 19.90),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-16', 'Exxon', 'Columbia, SC', 'SC', 37.2, 4.38, 163.04, 18.60),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-20', 'BP', 'Charlotte, NC', 'NC', 41.5, 4.44, 184.26, 20.75),
('ff8e62bc-85f8-4f20-b72b-bec2266ffd28', '2024-06-25', 'Sheetz', 'Raleigh, NC', 'NC', 44.9, 4.47, 200.70, 22.45);