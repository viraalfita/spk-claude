-- Sample SPK data for testing (Updated for dynamic payments)

-- Sample SPK 1: Office Renovation (3 payment terms - standard)
INSERT INTO spk (
  spk_number, vendor_name, vendor_email, vendor_phone,
  project_name, project_description, contract_value, currency,
  start_date, end_date,
  status, created_by, created_by_email, notes
) VALUES (
  'SPK-2026-001',
  'PT Vendor Jaya',
  'vendor@vendorjaya.com',
  '+62-812-3456-7890',
  'Office Renovation Phase 1',
  'Complete renovation of 3rd floor office space including electrical, furniture, and paint',
  100000000,
  'IDR',
  '2026-01-21',
  '2026-03-21',
  'published',
  'Admin User',
  'admin@company.com',
  'Urgent project - prioritize quality materials'
);

-- Sample SPK 2: Website Development (USD currency, 2 terms)
INSERT INTO spk (
  spk_number, vendor_name, vendor_email, vendor_phone,
  project_name, project_description, contract_value, currency,
  start_date, end_date,
  status, created_by, created_by_email, notes
) VALUES (
  'SPK-2026-002',
  'Digital Solutions Indonesia',
  'contact@digitalsolutions.id',
  '+62-821-9876-5432',
  'Corporate Website Redesign',
  'Modern, responsive website with CMS integration and SEO optimization',
  5000,
  'USD',
  '2026-01-22',
  '2026-04-22',
  'published',
  'Project Manager',
  'pm@company.com',
  'Requires staging environment for client review'
);

-- Sample SPK 3: Construction Project (5 payment terms - complex)
INSERT INTO spk (
  spk_number, vendor_name, vendor_email,
  project_name, contract_value, currency,
  start_date,
  status, created_by, created_by_email
) VALUES (
  'SPK-2026-003',
  'PT Konstruksi Mandiri',
  'info@konstruksimandiri.com',
  'Parking Lot Expansion',
  250000000,
  'IDR',
  '2026-02-01',
  'draft',
  'Admin User',
  'admin@company.com'
);

-- Payments for SPK-001 (3 terms using percentage)
INSERT INTO payment (spk_id, term_name, term_order, amount, percentage, input_type, status, paid_date, payment_reference, updated_by)
SELECT
  id, 'Down Payment', 1, 30000000, 30, 'percentage', 'paid', '2026-01-21', 'TRX-20260121-001', 'finance@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001'
UNION ALL
SELECT
  id, 'Progress Payment', 2, 40000000, 40, 'percentage', 'pending', NULL, NULL, 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001'
UNION ALL
SELECT
  id, 'Final Payment', 3, 30000000, 30, 'percentage', 'pending', NULL, NULL, 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001';

-- Payments for SPK-002 (2 terms - using nominal amounts in USD)
INSERT INTO payment (spk_id, term_name, term_order, amount, percentage, input_type, status, paid_date, payment_reference, updated_by)
SELECT
  id, 'Initial Payment', 1, 2500, 50, 'nominal', 'paid', '2026-01-22', 'USD-TRX-001', 'finance@company.com'
FROM spk WHERE spk_number = 'SPK-2026-002'
UNION ALL
SELECT
  id, 'Final Payment', 2, 2500, 50, 'nominal', 'pending', NULL, NULL, 'pm@company.com'
FROM spk WHERE spk_number = 'SPK-2026-002';

-- Payments for SPK-003 (5 terms - mixed percentage)
INSERT INTO payment (spk_id, term_name, term_order, amount, percentage, input_type, status, updated_by)
SELECT
  id, 'Down Payment', 1, 50000000, 20, 'percentage', 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'Progress 1 - Foundation', 2, 50000000, 20, 'percentage', 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'Progress 2 - Structure', 3, 50000000, 20, 'percentage', 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'Progress 3 - Finishing', 4, 50000000, 20, 'percentage', 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'Final Payment', 5, 50000000, 20, 'percentage', 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003';

-- Sample Vendors (Optional table)
INSERT INTO vendor (name, email, phone, access_token)
VALUES
  ('PT Vendor Jaya', 'vendor@vendorjaya.com', '+62-812-3456-7890', 'token-abc123xyz'),
  ('Digital Solutions Indonesia', 'contact@digitalsolutions.id', '+62-821-9876-5432', 'token-def456uvw'),
  ('PT Konstruksi Mandiri', 'info@konstruksimandiri.com', '+62-811-2233-4455', 'token-ghi789rst');
