# Product Requirements Document: SPK Creator

**Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** Draft  
**Type:** Proof of Concept (PoC)

---

## 1. Overview

**SPK Creator** is an internal tool designed to digitize vendor work orders (SPK) and enable transparent payment tracking. This is a proof of concept to validate the core workflow and technical approach before building a production-ready system.

### What is SPK?

SPK (Surat Perintah Kerja) is a work order document issued to vendors that outlines project scope, contract value, and payment terms.

---

## 2. Goals & Objectives

### Primary Goals

1. **Digitize SPK creation** – Replace manual/spreadsheet-based work orders with a structured digital form
2. **Transparent payment tracking** – Enable real-time visibility into payment status across all stakeholders
3. **Automate notifications** – Reduce manual communication via automated Slack/Email alerts
4. **Generate official PDFs** – Produce standardized SPK documents directly from the application

### Success Criteria (PoC)

- ✅ Internal users can create and publish SPKs in under 5 minutes
- ✅ Vendors can view their SPKs and payment status without manual updates
- ✅ PDF generation works reliably with correct data
- ✅ n8n automation triggers successfully on key events

---

## 3. User Personas

### Internal User (SPK Creator)

- **Role:** Project Manager / Finance Team
- **Needs:** Create SPKs quickly, track payment status, send updates to vendors
- **Access Level:** Full CRUD on SPKs and payments

### Vendor (Read-Only User)

- **Role:** External contractor/supplier
- **Needs:** View their SPKs, check payment status, download PDF copies
- **Access Level:** Read-only access to their own SPKs

---

## 4. Core Features

### 4.1 SPK Creation Form

**Description:** A multi-step or single-page form to create new SPK records.

**Required Fields:**

- Vendor name
- Vendor contact (email, phone - optional but recommended)
- Project name/description
- SPK number (auto-generated or manual)
- Contract value (total amount)
- Currency (default: IDR)
- Start date
- End date (optional)
- Payment terms breakdown:
  - Down Payment (DP) % and amount
  - Progress Payment % and amount
  - Final Payment % and amount
- Additional notes/attachments (optional)

**Validations:**

- Payment terms must sum to 100% of contract value
- All required fields must be filled
- Vendor email format validation

**User Flow:**

1. User clicks "Create SPK"
2. Fills out form
3. Reviews summary
4. Saves as draft OR publishes immediately
5. On publish → PDF generated + n8n webhook triggered

---

### 4.2 Payment Terms Structure

Each SPK has 3 payment milestones:

| Term              | Description                                   | Typical % |
| ----------------- | --------------------------------------------- | --------- |
| DP (Down Payment) | Initial payment upon contract signing         | 30%       |
| Progress Payment  | Mid-project payment upon milestone completion | 40%       |
| Final Payment     | Payment upon project completion               | 30%       |

**Payment Statuses:**

- `Pending` – Not yet paid
- `Paid` – Payment completed
- `Overdue` – Past due date (optional for PoC)

**User Actions:**

- Mark payment as paid (manual update)
- Add payment date
- Add payment reference/proof (optional text field)

---

### 4.3 Native PDF Generation

**Description:** Generate official SPK PDF documents directly in the app (server-side rendering).

**Technical Approach:**

- Use `@react-pdf/renderer` or `puppeteer` for server-side PDF generation
- Render PDF from React components or HTML templates
- Store PDF temporarily or generate on-demand

**PDF Content:**

- Company header/logo (optional)
- SPK number and date
- Vendor details
- Project details
- Contract value and payment breakdown
- Terms and conditions (static text)
- Signature placeholders (visual only, not functional)

**User Flow:**

1. User publishes SPK → PDF auto-generated
2. User/Vendor clicks "Download PDF" → generates/serves PDF file

---

### 4.4 Vendor Dashboard (Read-Only)

**Description:** A dedicated view for vendors to see their SPKs and payment status.

**Access Method:**

- Simple authentication via unique link (e.g., `/vendor/[vendorId]?token=xyz`)
- OR basic email/password login (optional for PoC)

**Dashboard Contents:**

- List of all SPKs for this vendor
- SPK details (project, value, dates)
- Payment status breakdown (DP, Progress, Final)
- Download PDF button
- Last updated timestamp

**No Edit Access:** Vendors cannot create or modify SPKs.

---

### 4.5 Payment Status Tracking

**Description:** Internal dashboard to view and update payment statuses across all SPKs.

**Features:**

- Table view of all SPKs with filters:
  - By vendor
  - By status (draft, published)
  - By payment status (paid, pending, overdue)
- Quick actions:
  - Mark payment as paid
  - View SPK details
  - Download PDF
- Status indicators (color-coded badges)

**Update Flow:**

1. Internal user marks payment as "Paid"
2. Payment date and reference recorded
3. n8n webhook triggered → notification sent

---

### 4.6 Automation via n8n

**Description:** Webhook-based automation for key events.

**Trigger Events:**

1. **SPK Published**
   - Webhook payload: SPK details, vendor email, PDF link
   - Actions: Send Slack notification + email to vendor

2. **Payment Status Updated**
   - Webhook payload: SPK number, payment term, new status
   - Actions: Send update to vendor + internal Slack channel

**Implementation:**

- Next.js API route posts to n8n webhook URL
- n8n workflow handles:
  - Slack message formatting
  - Email composition (via SendGrid, Resend, or SMTP)
  - Error handling/retries

**n8n Workflow Examples:**

- Slack message: "🎉 New SPK #{number} published for {vendor} - {project}"
- Email: Professional template with SPK summary and PDF attachment

---

## 5. Technical Architecture

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** React Server Components + Server Actions (no client-side state lib needed)
- **Forms:** React Hook Form + Zod validation

### Backend

- **API Layer:** Next.js Server Actions + API Routes
- **Database:** Supabase (PostgreSQL)
- **ORM/Client:** Supabase JavaScript Client
- **PDF Generation:** @react-pdf/renderer or puppeteer
- **Authentication:** Supabase Auth (with token-based vendor access)

### Integrations

- **n8n:** Self-hosted or cloud instance with webhook nodes
- **Slack:** Incoming webhooks or Slack API
- **Email:** Resend, SendGrid, or Nodemailer

### Deployment (Optional for PoC)

- **Platform:** Vercel, Railway, or local dev environment
- **Database:** Supabase (hosted PostgreSQL with free tier)

---

## 6. Data Models

### SPK Table

```typescript
interface SPK {
  id: string;
  spkNumber: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  projectName: string;
  projectDescription?: string;
  contractValue: number;
  currency: string; // e.g., "IDR"
  startDate: Date;
  endDate?: Date;

  // Payment breakdown (percentages and amounts)
  dpPercentage: number;
  dpAmount: number;
  progressPercentage: number;
  progressAmount: number;
  finalPercentage: number;
  finalAmount: number;

  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID or name
  notes?: string;
  pdfUrl?: string; // Path to generated PDF
}
```

### Payment Table

```typescript
interface Payment {
  id: string;
  spkId: string; // Foreign key to SPK
  term: "dp" | "progress" | "final";
  amount: number;
  percentage: number;
  status: "pending" | "paid" | "overdue";
  paidDate?: Date;
  paymentReference?: string;
  updatedAt: Date;
  updatedBy: string;
}
```

### Vendor Table (Optional)

```typescript
interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  accessToken?: string; // For vendor dashboard access
  createdAt: Date;
}
```

---

## 6.1 Database Mockup (Supabase Schema)

### SQL Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SPK Table
CREATE TABLE spk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_number VARCHAR(50) UNIQUE NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_email VARCHAR(255),
  vendor_phone VARCHAR(50),
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  contract_value NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Payment breakdown
  dp_percentage NUMERIC(5, 2) NOT NULL,
  dp_amount NUMERIC(15, 2) NOT NULL,
  progress_percentage NUMERIC(5, 2) NOT NULL,
  progress_amount NUMERIC(15, 2) NOT NULL,
  final_percentage NUMERIC(5, 2) NOT NULL,
  final_amount NUMERIC(15, 2) NOT NULL,

  status VARCHAR(20) CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  notes TEXT,
  pdf_url TEXT
);

-- Payment Table
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_id UUID NOT NULL REFERENCES spk(id) ON DELETE CASCADE,
  term VARCHAR(20) CHECK(term IN ('dp', 'progress', 'final')) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  status VARCHAR(20) CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  paid_date DATE,
  payment_reference VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) NOT NULL
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
```

### Sample Data

```sql
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
) RETURNING id;

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
) RETURNING id;

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
) RETURNING id;

-- Note: To insert payments, you'll need to use the actual UUID returned from the SPK inserts
-- For demo purposes, you can query the SPK table first:

-- Payments for SPK-001 (Office Renovation)
-- Replace <spk-001-uuid> with actual UUID from first INSERT
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
```

### Sample Queries

```sql
-- Get all published SPKs with vendor info
SELECT
  spk_number, vendor_name, project_name, contract_value,
  currency, status, created_at
FROM spk
WHERE status = 'published'
ORDER BY created_at DESC;

-- Get SPK details with payment breakdown
SELECT
  s.spk_number, s.vendor_name, s.project_name,
  s.contract_value, s.currency,
  p.term, p.amount, p.status as payment_status,
  p.paid_date, p.payment_reference
FROM spk s
LEFT JOIN payment p ON s.id = p.spk_id
WHERE s.spk_number = 'SPK-2026-001'
ORDER BY
  CASE p.term
    WHEN 'dp' THEN 1
    WHEN 'progress' THEN 2
    WHEN 'final' THEN 3
  END;

-- Get all SPKs for a specific vendor
SELECT
  spk_number, project_name, contract_value, status, created_at
FROM spk
WHERE vendor_name = 'PT Vendor Jaya'
ORDER BY created_at DESC;

-- Get payment summary across all SPKs
SELECT
  status,
  COUNT(*) as payment_count,
  SUM(amount) as total_amount
FROM payment
GROUP BY status;

-- Get pending payments with SPK details
SELECT
  s.spk_number, s.vendor_name, s.project_name,
  p.term, p.amount, p.status
FROM payment p
JOIN spk s ON p.spk_id = s.id
WHERE p.status = 'pending' AND s.status = 'published'
ORDER BY s.created_at ASC;

-- Get SPKs with at least one paid payment
SELECT DISTINCT
  s.spk_number, s.vendor_name, s.project_name,
  s.contract_value,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as paid_total
FROM spk s
JOIN payment p ON s.id = p.spk_id
GROUP BY s.id
HAVING paid_count > 0;
```

### Supabase Setup

#### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

```typescript
// lib/supabase/server.ts - For Server Actions
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

#### Database Types (Auto-generated)

```typescript
// lib/supabase/types.ts
export interface Database {
  public: {
    Tables: {
      spk: {
        Row: {
          id: string;
          spk_number: string;
          vendor_name: string;
          vendor_email: string | null;
          vendor_phone: string | null;
          project_name: string;
          project_description: string | null;
          contract_value: number;
          currency: string;
          start_date: string;
          end_date: string | null;
          dp_percentage: number;
          dp_amount: number;
          progress_percentage: number;
          progress_amount: number;
          final_percentage: number;
          final_amount: number;
          status: "draft" | "published";
          created_at: string;
          updated_at: string;
          created_by: string;
          notes: string | null;
          pdf_url: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["spk"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["spk"]["Insert"]>;
      };
      payment: {
        Row: {
          id: string;
          spk_id: string;
          term: "dp" | "progress" | "final";
          amount: number;
          percentage: number;
          status: "pending" | "paid" | "overdue";
          paid_date: string | null;
          payment_reference: string | null;
          updated_at: string;
          updated_by: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["payment"]["Row"],
          "id" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["payment"]["Insert"]>;
      };
      vendor: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          access_token: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["vendor"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["vendor"]["Insert"]>;
      };
    };
  };
}
```

#### Example Server Action

```typescript
// app/actions/spk.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSPK(data: any) {
  const { data: spk, error } = await supabaseAdmin
    .from("spk")
    .insert({
      spk_number: data.spkNumber,
      vendor_name: data.vendorName,
      vendor_email: data.vendorEmail,
      project_name: data.projectName,
      contract_value: data.contractValue,
      // ... other fields
      status: "draft",
      created_by: "admin@company.com",
    })
    .select()
    .single();

  if (error) throw error;

  // Create payment records
  const payments = [
    { term: "dp", amount: data.dpAmount, percentage: data.dpPercentage },
    {
      term: "progress",
      amount: data.progressAmount,
      percentage: data.progressPercentage,
    },
    {
      term: "final",
      amount: data.finalAmount,
      percentage: data.finalPercentage,
    },
  ];

  await supabaseAdmin.from("payment").insert(
    payments.map((p) => ({
      spk_id: spk.id,
      ...p,
      status: "pending",
      updated_by: "admin@company.com",
    })),
  );

  revalidatePath("/dashboard");
  return spk;
}
```

---

## 7. User Flows

### Flow 1: Create and Publish SPK

1. Internal user logs in
2. Clicks "Create New SPK"
3. Fills out form (vendor, project, payment terms)
4. Reviews summary page
5. Clicks "Publish"
6. System:
   - Saves SPK to database
   - Generates PDF
   - Sends webhook to n8n
   - Shows success message with link to SPK
7. n8n sends Slack notification + email to vendor

### Flow 2: Vendor Views Dashboard

1. Vendor receives email with access link
2. Clicks link → lands on vendor dashboard
3. Sees list of their SPKs
4. Clicks on SPK → sees details + payment status
5. Downloads PDF if needed

### Flow 3: Update Payment Status

1. Internal user opens payment tracking page
2. Finds SPK in table
3. Clicks "Mark as Paid" for specific payment term
4. Enters payment date and reference
5. Saves update
6. System:
   - Updates database
   - Sends webhook to n8n
   - Shows success message
7. n8n sends notification to vendor

---

## 8. Out of Scope (Not in PoC)

The following features are explicitly excluded from this proof of concept:

- ❌ Digital signatures (e.g., DocuSign integration)
- ❌ Multi-level approval workflows
- ❌ Advanced role-based permissions (admin, approver, viewer)
- ❌ Audit logs / change history
- ❌ File attachments for supporting documents
- ❌ Invoice generation separate from SPK
- ❌ Payment reminders / overdue alerts (automated)
- ❌ Multi-currency conversion
- ❌ Batch SPK creation
- ❌ Advanced reporting/analytics dashboard
- ❌ Mobile app
- ❌ Real-time collaboration features

These may be considered for future iterations based on PoC feedback.

---

## 9. Non-Functional Requirements

### Performance

- Page load time < 2s on local network
- PDF generation < 5s per document
- Support up to 100 SPKs in database (PoC limit)

### Reliability

- n8n webhook delivery with basic error handling
- Graceful fallback if PDF generation fails

### Usability

- Clean, intuitive UI using shadcn/ui components
- Mobile-responsive (basic support)
- Form validation with clear error messages

### Security (Basic PoC Level)

- No sensitive data in URLs
- HTTPS for deployment (if hosted)
- Token-based vendor access (not production-grade)

---

## 10. Open Questions & Assumptions

### Assumptions Made

- SPK numbers can be auto-generated (e.g., `SPK-2026-001`)
- Payment percentages are flexible (not always 30-40-30 split)
- Single currency per SPK (no multi-currency)
- One internal user role (no complex permissions)
- Vendors identified by email (no formal vendor master data)

### Questions for Future Clarification

- Should vendors be able to upload payment proof documents?
- Do we need to track who made payment updates (audit trail)?
- Should there be notifications for approaching payment deadlines?
- Is there a specific PDF template/format required?

---

## 11. Implementation Notes for AI Co-Pilot

### Recommended Build Order

1. **Setup:** Next.js + TypeScript + shadcn/ui scaffolding
2. **Database:** Supabase project setup + run SQL migrations
3. **SPK Creation:** Form + validation + save to Supabase
4. **SPK List/Detail:** Internal dashboard pages
5. **PDF Generation:** Implement server-side PDF rendering
6. **Payment Tracking:** Update payment status functionality
7. **Vendor Dashboard:** Read-only view with simple auth
8. **n8n Integration:** Webhook posting on key events
9. **Testing:** Manual testing of full workflows

### Key Technical Decisions

- Use Server Actions for mutations (create SPK, update payment)
- Use API routes for PDF generation endpoints
- Use Supabase Auth for internal users, token-based access for vendors
- Store PDFs in Supabase Storage or generate on-demand
- Leverage Supabase Row Level Security (RLS) for data access control
- Use Supabase Realtime (optional) for live payment status updates

### Suggested Libraries

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@react-pdf/renderer": "^3.1.0"
  },
  "devDependencies": {
    "supabase": "^1.0.0"
  }
}
```

---

## 12. Success Metrics (PoC Validation)

This PoC will be considered successful if:

1. ✅ **Feature Completeness:** All core features implemented and functional
2. ✅ **Workflow Validation:** End-to-end flows (create SPK → generate PDF → notify vendor → update payment) work without errors
3. ✅ **Technical Feasibility:** Chosen tech stack proves viable for future production build
4. ✅ **User Feedback:** Internal team can use the tool without confusion (basic usability test)
5. ✅ **Integration Test:** n8n automation triggers successfully and delivers notifications

---

## Appendix A: Sample SPK PDF Layout

```
┌─────────────────────────────────────────┐
│  [Company Logo]                         │
│                                         │
│  SURAT PERINTAH KERJA (SPK)            │
│  No: SPK-2026-001                      │
│  Date: January 21, 2026                │
├─────────────────────────────────────────┤
│  VENDOR INFORMATION                     │
│  Name: PT Vendor Jaya                  │
│  Contact: vendor@example.com           │
├─────────────────────────────────────────┤
│  PROJECT DETAILS                        │
│  Project: Office Renovation             │
│  Contract Value: Rp 100,000,000        │
│  Duration: Jan 21 - Mar 21, 2026       │
├─────────────────────────────────────────┤
│  PAYMENT TERMS                          │
│  • Down Payment (30%): Rp 30,000,000   │
│  • Progress Payment (40%): Rp 40,000,000│
│  • Final Payment (30%): Rp 30,000,000  │
├─────────────────────────────────────────┤
│  [Terms and conditions text...]         │
│                                         │
│  Authorized By: ______________          │
│  Date: ______________                   │
└─────────────────────────────────────────┘
```

---

**End of Document**
