
-- Demo user ID
-- b71bc4fb-5bf3-4103-ba8b-05bda582a339

-- 1. Insert demo truck
INSERT INTO public.trucks (id, user_id, unit_number, make, model, year, vin, license_plate, registration_state, fuel_type, ifta_account_number, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b71bc4fb-5bf3-4103-ba8b-05bda582a339',
  'TRUCK-101',
  'Freightliner',
  'Cascadia',
  2022,
  '1FUJHHDR3NLMK5678',
  'TX-AB1234',
  'TX',
  'diesel',
  'IFTA-TX-2024-001',
  true
);

-- 2. Insert 3 demo trips
INSERT INTO public.trips (id, user_id, truck_id, trip_number, origin_city, origin_state, origin_zip, destination_city, destination_state, destination_zip, start_date, end_date, total_miles, fuel_gallons, fuel_cost, status, notes)
VALUES
  ('11111111-aaaa-bbbb-cccc-111111111111', 'b71bc4fb-5bf3-4103-ba8b-05bda582a339', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TRIP-001', 'Dallas', 'TX', '75201', 'Atlanta', 'GA', '30301', '2026-01-15', '2026-01-17', 795, 118.5, 412.30, 'completed', 'Regular freight run Dallas to Atlanta'),
  ('22222222-aaaa-bbbb-cccc-222222222222', 'b71bc4fb-5bf3-4103-ba8b-05bda582a339', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TRIP-002', 'Atlanta', 'GA', '30301', 'Chicago', 'IL', '60601', '2026-01-20', '2026-01-22', 716, 106.8, 370.50, 'completed', 'Return load Atlanta to Chicago'),
  ('33333333-aaaa-bbbb-cccc-333333333333', 'b71bc4fb-5bf3-4103-ba8b-05bda582a339', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TRIP-003', 'Chicago', 'IL', '60601', 'Dallas', 'TX', '75201', '2026-02-01', '2026-02-03', 920, 137.0, 475.80, 'completed', 'Southbound run back to Dallas');

-- 3. Insert trip_miles (state breakdowns)
-- Trip 1: Dallas TX → Atlanta GA (TX, LA, MS, AL, GA)
INSERT INTO public.trip_miles (user_id, trip_id, state_code, miles) VALUES
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '11111111-aaaa-bbbb-cccc-111111111111', 'TX', 180),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '11111111-aaaa-bbbb-cccc-111111111111', 'LA', 190),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '11111111-aaaa-bbbb-cccc-111111111111', 'MS', 145),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '11111111-aaaa-bbbb-cccc-111111111111', 'AL', 160),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '11111111-aaaa-bbbb-cccc-111111111111', 'GA', 120);

-- Trip 2: Atlanta GA → Chicago IL (GA, TN, KY, IN, IL)
INSERT INTO public.trip_miles (user_id, trip_id, state_code, miles) VALUES
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '22222222-aaaa-bbbb-cccc-222222222222', 'GA', 130),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '22222222-aaaa-bbbb-cccc-222222222222', 'TN', 180),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '22222222-aaaa-bbbb-cccc-222222222222', 'KY', 170),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '22222222-aaaa-bbbb-cccc-222222222222', 'IN', 140),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '22222222-aaaa-bbbb-cccc-222222222222', 'IL', 96);

-- Trip 3: Chicago IL → Dallas TX (IL, MO, OK, TX)
INSERT INTO public.trip_miles (user_id, trip_id, state_code, miles) VALUES
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '33333333-aaaa-bbbb-cccc-333333333333', 'IL', 130),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '33333333-aaaa-bbbb-cccc-333333333333', 'MO', 260),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '33333333-aaaa-bbbb-cccc-333333333333', 'OK', 240),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '33333333-aaaa-bbbb-cccc-333333333333', 'TX', 290);

-- 4. Insert 5 fuel receipts across different states
INSERT INTO public.receipts (user_id, receipt_date, vendor, location, state_code, gallons, price_per_gallon, total_amount, fuel_tax) VALUES
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '2026-01-15', 'Loves Travel Stop', 'Shreveport, LA', 'LA', 85.2, 3.49, 297.35, 16.80),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '2026-01-16', 'Pilot Flying J', 'Birmingham, AL', 'AL', 72.5, 3.39, 245.78, 14.25),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '2026-01-21', 'TA Travel Center', 'Nashville, TN', 'TN', 90.0, 3.45, 310.50, 17.50),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '2026-02-01', 'Casey''s General Store', 'Springfield, MO', 'MO', 78.3, 3.29, 257.61, 15.40),
  ('b71bc4fb-5bf3-4103-ba8b-05bda582a339', '2026-02-02', 'QuikTrip', 'Oklahoma City, OK', 'OK', 82.0, 3.35, 274.70, 16.10);
