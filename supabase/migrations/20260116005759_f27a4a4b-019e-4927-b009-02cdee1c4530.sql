-- Fix: Restrict realtime publication to only tables that need it
-- This reduces attack surface and improves performance

-- Drop the existing publication that broadcasts all tables
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create a new publication with only the tables that need realtime updates
-- Tables included:
-- - profiles: for subscription status updates in real-time
-- - receipts: for OCR processing status updates
-- - trips: for active trip tracking
-- - trucks: for fleet management updates
-- - bills_of_lading: for delivery status tracking
-- - trip_miles: for mileage tracking updates

CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.profiles,
  public.receipts,
  public.trips,
  public.trucks,
  public.bills_of_lading,
  public.trip_miles;

-- Tables NOT included (no real-time need):
-- - test_accounts: static data, admin-only
-- - invoices: rarely updated, webhook-driven
-- - subscribers: webhook-driven updates
-- - user_roles: admin-only changes
-- - trip_logs: historical data
-- - vehicles: legacy table, minimal updates