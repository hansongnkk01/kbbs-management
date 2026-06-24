-- ============================================
-- KBBS Management System - Schema Supabase
-- Jalankan SQL ni dalam Supabase SQL Editor
-- ============================================

-- Table untuk kawasan / lokasi bilik sewa
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table untuk setiap bilik dalam sesebuah kawasan
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  info TEXT,
  tenant_phone TEXT,
  checkin_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policies - semua admin yang login bole buat semua benda
CREATE POLICY "Admin bole baca properties"
  ON properties FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin bole tambah properties"
  ON properties FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin bole update properties"
  ON properties FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin bole delete properties"
  ON properties FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin bole baca rooms"
  ON rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin bole tambah rooms"
  ON rooms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin bole update rooms"
  ON rooms FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin bole delete rooms"
  ON rooms FOR DELETE TO authenticated USING (true);

-- Aktifkan Realtime untuk update live
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- ============================================
-- Data awal - 4 kawasan dari mockup gambar
-- ============================================
INSERT INTO properties (name, order_index) VALUES
  ('ALAMESRA 1', 0),
  ('ALAMESRA 2', 1),
  ('SEGAMA', 2),
  ('TANJUNG ARU', 3);

-- Bilik contoh untuk ALAMESRA 1
-- (Ubah property_id dengan id sebenar selepas insert properties)
-- INSERT INTO rooms (property_id, room_number, price, status, info, tenant_phone, checkin_date, order_index)
-- VALUES
--   ('<property_id>', '01', 250.00, 'available', 'Windowed', NULL, NULL, 0),
--   ('<property_id>', '02', 350.00, 'available', 'Windowed', NULL, NULL, 1),
--   ('<property_id>', '03', 200.00, 'occupied', 'Ventilation', '013 441 3415', '2026-02-15', 2);
