-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SPK Table (Updated for dynamic payments and multi-currency)
CREATE TABLE spk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated, but editable
  vendor_name VARCHAR(255) NOT NULL,
  vendor_email VARCHAR(255),
  vendor_phone VARCHAR(50),
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  contract_value NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR', -- Supports: IDR, USD, SGD, EUR, MYR, etc.
  start_date DATE NOT NULL,
  end_date DATE,

  status VARCHAR(20) CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL, -- Auto from session: user name
  created_by_email VARCHAR(255) NOT NULL, -- Auto from session: user email
  notes TEXT,
  pdf_url TEXT
);

-- Payment Table (Updated for dynamic multi-payment support)
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_id UUID NOT NULL REFERENCES spk(id) ON DELETE CASCADE,
  term_name VARCHAR(100) NOT NULL, -- Flexible: "Down Payment", "Progress 1", etc.
  term_order INTEGER NOT NULL, -- Sequence: 1, 2, 3, ...
  amount NUMERIC(15, 2) NOT NULL,
  percentage NUMERIC(5, 2), -- Optional: if user entered as percentage
  input_type VARCHAR(20) CHECK(input_type IN ('percentage', 'nominal')) NOT NULL,
  status VARCHAR(20) CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  payment_reference VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) NOT NULL,
  UNIQUE(spk_id, term_order) -- Prevent duplicate orders for same SPK
);

-- Vendor Table (Optional)
CREATE TABLE vendor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  access_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_spk_vendor_name ON spk(vendor_name);
CREATE INDEX idx_spk_status ON spk(status);
CREATE INDEX idx_spk_created_at ON spk(created_at);
CREATE INDEX idx_payment_spk_id ON payment(spk_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_vendor_email ON vendor(email);

-- Enable Row Level Security (RLS)
ALTER TABLE spk ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - adjust based on auth strategy)
-- Allow internal users full access (authenticated users)
CREATE POLICY "Allow full access for authenticated users" ON spk
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access for authenticated users" ON payment
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow vendors to view their own SPKs (using vendor_email)
CREATE POLICY "Vendors can view their own SPKs" ON spk
  FOR SELECT USING (vendor_email = auth.jwt() ->> 'email');

CREATE POLICY "Vendors can view payments for their SPKs" ON payment
  FOR SELECT USING (
    spk_id IN (
      SELECT id FROM spk WHERE vendor_email = auth.jwt() ->> 'email'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spk_updated_at BEFORE UPDATE ON spk
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON payment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
