-- Sample SPK data for testing

-- Sample SPK 1: Office Renovation Project
INSERT INTO spk (
  spk_number, vendor_name, vendor_email, vendor_phone,
  project_name, project_description, contract_value, currency,
  start_date, end_date,
  dp_percentage, dp_amount, progress_percentage, progress_amount,
  final_percentage, final_amount,
  status, created_by, notes
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
  30, 30000000,
  40, 40000000,
  30, 30000000,
  'published',
  'admin@company.com',
  'Urgent project - prioritize quality materials'
);

-- Sample SPK 2: Website Development
INSERT INTO spk (
  spk_number, vendor_name, vendor_email, vendor_phone,
  project_name, project_description, contract_value, currency,
  start_date, end_date,
  dp_percentage, dp_amount, progress_percentage, progress_amount,
  final_percentage, final_amount,
  status, created_by, notes
) VALUES (
  'SPK-2026-002',
  'Digital Solutions Indonesia',
  'contact@digitalsolutions.id',
  '+62-821-9876-5432',
  'Corporate Website Redesign',
  'Modern, responsive website with CMS integration and SEO optimization',
  75000000,
  'IDR',
  '2026-01-22',
  '2026-04-22',
  25, 18750000,
  50, 37500000,
  25, 18750000,
  'published',
  'pm@company.com',
  'Requires staging environment for client review'
);

-- Sample SPK 3: Draft Project
INSERT INTO spk (
  spk_number, vendor_name, vendor_email,
  project_name, contract_value, currency,
  start_date,
  dp_percentage, dp_amount, progress_percentage, progress_amount,
  final_percentage, final_amount,
  status, created_by
) VALUES (
  'SPK-2026-003',
  'PT Konstruksi Mandiri',
  'info@konstruksimandiri.com',
  'Parking Lot Expansion',
  150000000,
  'IDR',
  '2026-02-01',
  30, 45000000,
  40, 60000000,
  30, 45000000,
  'draft',
  'admin@company.com'
);

-- Payments for SPK-001 (Office Renovation)
INSERT INTO payment (spk_id, term, amount, percentage, status, paid_date, payment_reference, updated_by)
SELECT
  id, 'dp', 30000000, 30, 'paid', '2026-01-21', 'TRX-20260121-001', 'finance@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001'
UNION ALL
SELECT
  id, 'progress', 40000000, 40, 'pending', NULL, NULL, 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001'
UNION ALL
SELECT
  id, 'final', 30000000, 30, 'pending', NULL, NULL, 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-001';

-- Payments for SPK-002 (Website Development)
INSERT INTO payment (spk_id, term, amount, percentage, status, paid_date, payment_reference, updated_by)
SELECT
  id, 'dp', 18750000, 25, 'paid', '2026-01-22', 'TRX-20260122-001', 'finance@company.com'
FROM spk WHERE spk_number = 'SPK-2026-002'
UNION ALL
SELECT
  id, 'progress', 37500000, 50, 'pending', NULL, NULL, 'pm@company.com'
FROM spk WHERE spk_number = 'SPK-2026-002'
UNION ALL
SELECT
  id, 'final', 18750000, 25, 'pending', NULL, NULL, 'pm@company.com'
FROM spk WHERE spk_number = 'SPK-2026-002';

-- Payments for SPK-003 (Draft)
INSERT INTO payment (spk_id, term, amount, percentage, status, updated_by)
SELECT
  id, 'dp', 45000000, 30, 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'progress', 60000000, 40, 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003'
UNION ALL
SELECT
  id, 'final', 45000000, 30, 'pending', 'admin@company.com'
FROM spk WHERE spk_number = 'SPK-2026-003';

-- Sample Vendors (Optional table)
INSERT INTO vendor (name, email, phone, access_token)
VALUES
  ('PT Vendor Jaya', 'vendor@vendorjaya.com', '+62-812-3456-7890', 'token-abc123xyz'),
  ('Digital Solutions Indonesia', 'contact@digitalsolutions.id', '+62-821-9876-5432', 'token-def456uvw'),
  ('PT Konstruksi Mandiri', 'info@konstruksimandiri.com', '+62-811-2233-4455', 'token-ghi789rst');
