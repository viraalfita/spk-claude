# Specification Updates Summary

**Date:** February 3, 2026  
**Status:** Completed  
**Type:** Feature Specification Revision

---

## Overview

Dokumen ini merangkum revisi spesifikasi fitur SPK Creator berdasarkan feedback dan penyesuaian untuk memastikan implementasi yang simple, production-ready, dan mudah dikembangkan di fase berikutnya.

---

## Changes Summary

### 1. ✅ SPK Numbering

**Previous:** Manual input atau auto-generate tanpa override
**Updated:**

- **Auto-generate** oleh sistem dengan format `SPK-YYYY-NNN`
- **Editable** oleh user untuk manual override jika diperlukan
- **Logic di backend** untuk mencegah duplikasi
- Backend function: `generateSPKNumber()` dengan check uniqueness

**Impact:**

- Database: `spk_number` tetap UNIQUE constraint
- Form: Field editable dengan placeholder dari auto-generated value
- Validation: Backend verifikasi uniqueness sebelum save

---

### 2. ✅ Progress Indicator

**Previous:** Tidak dispesifikasikan dengan jelas
**Updated:**

- **Step form** sebagai indikator progres pengisian
- **Tidak perlu progress bar visual kompleks** pada tahap ini
- **4 Steps:**
  1. Vendor & Project Details
  2. Contract Value & Currency
  3. Payment Terms (Dynamic)
  4. Review & Confirm

**Impact:**

- UI/UX: Multi-step form component
- State management: Track current step
- Navigation: Next/Previous buttons dengan validation per step

---

### 3. ✅ Payment Terms (Dynamic Multi-Payment)

**Previous:** Fixed 3 payment terms (DP, Progress, Final)
**Updated:**

- **Dynamic multi-payment** mendukung 1x, 2x, 3x, atau lebih
- User dapat **add/remove payment rows** secara fleksibel
- Setiap payment:
  - `term_name`: String (e.g., "Down Payment", "Progress 1", "Final")
  - `term_order`: Integer untuk sequence
  - `amount`: Nominal amount
  - `percentage`: Optional (nullable)
  - `input_type`: "percentage" atau "nominal"
- **Tidak diperlukan validasi konversi** otomatis

**Impact:**

- Database Schema:
  ```sql
  ALTER TABLE payment
  - Remove: term enum constraint
  - Add: term_name VARCHAR(100)
  - Add: term_order INTEGER
  - Add: input_type VARCHAR(20)
  - Add: percentage NUMERIC nullable
  - Add: UNIQUE(spk_id, term_order)
  ```
- UI: Dynamic form array dengan add/remove buttons
- Validation: Flexible (warning jika total > contract value, tapi tidak blocker)

---

### 4. ✅ Currency Support

**Previous:** Default IDR, dengan catatan USD
**Updated:**

- **Multiple currency options:** IDR, USD, SGD, EUR, MYR, dll.
- **Tidak perlu konversi** total ke IDR untuk saat ini
- Nilai kontrak **mengikuti currency yang dipilih** user
- Display dengan proper currency formatting

**Impact:**

- Database: `currency VARCHAR(10)` (sudah ada)
- UI: Dropdown/Select dengan currency options
- Format: Helper function `formatCurrency(amount, currency)`

---

### 5. ✅ Invoice/SPK Preview & Sharing

**Previous:** PDF generation otomatis saat publish
**Updated:**

- **PDF Preview** tersedia setelah publish
- **Shareable Link** di-generate untuk akses publik
- **Email notification TIDAK otomatis** - user memilih kapan send
- **Download PDF** available untuk internal & vendor

**Features:**

- Preview: In-app PDF viewer atau link to API endpoint
- Share Link: `/api/pdf/[id]?token=xxx`
- Email: Optional button "Send to Vendor"

**Impact:**

- Remove webhook automation pada publish
- Add shareable link generation logic
- Add optional email sending UI component

---

### 6. ✅ SPK Maker (Created By)

**Previous:** Manual input field
**Updated:**

- **Auto-populated dari session login user**
- Tidak perlu input manual
- Capture:
  - `created_by`: User name
  - `created_by_email`: User email

**Impact:**

- Database Schema:
  ```sql
  ALTER TABLE spk
  ADD COLUMN created_by_email VARCHAR(255) NOT NULL
  ```
- Server Action: Get from `session.user` object
- UI: Remove manual input, show as read-only info

---

### 7. ✅ Email System

**Previous:** n8n webhook → Email via workflow
**Updated:**

- **Resend API** sebagai email service utama
- **Direct API call** dari Next.js server actions
- **No n8n dependency** untuk email

**Implementation:**

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "noreply@company.com",
  to: vendor.email,
  subject: "New SPK Created",
  html: emailTemplate,
});
```

**Impact:**

- Remove n8n webhook calls for email
- Add Resend SDK to dependencies
- Environment variables: `RESEND_API_KEY`

---

### 8. ✅ Notification System

**Previous:** n8n webhook → Slack via workflow
**Updated:**

- **Slack API direct** (Webhook URL atau SDK)
- **No n8n dependency** untuk notifikasi
- Automatic internal notifications
- Simple, reliable implementation

**Implementation:**

```typescript
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: `🎉 New SPK #${spk.spk_number} published`,
  }),
});
```

**Impact:**

- Remove all n8n integration code
- Direct Slack webhook calls
- Environment variables: `SLACK_WEBHOOK_URL`

---

## Database Schema Changes

### Updated SPK Table

```sql
CREATE TABLE spk (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-gen, editable
  vendor_name VARCHAR(255) NOT NULL,
  vendor_email VARCHAR(255),
  vendor_phone VARCHAR(50),
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  contract_value NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR', -- Multiple options
  start_date DATE NOT NULL,
  end_date DATE,

  -- Removed: dp_percentage, dp_amount, progress_percentage, etc.

  status VARCHAR(20) CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL, -- Auto from session
  created_by_email VARCHAR(255) NOT NULL, -- Auto from session
  notes TEXT,
  pdf_url TEXT
);
```

### Updated Payment Table

```sql
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_id UUID NOT NULL REFERENCES spk(id) ON DELETE CASCADE,
  term_name VARCHAR(100) NOT NULL, -- Dynamic, not enum
  term_order INTEGER NOT NULL, -- Sequence
  amount NUMERIC(15, 2) NOT NULL,
  percentage NUMERIC(5, 2), -- Optional
  input_type VARCHAR(20) CHECK(input_type IN ('percentage', 'nominal')) NOT NULL,
  status VARCHAR(20) CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  payment_reference VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) NOT NULL,
  UNIQUE(spk_id, term_order) -- Prevent duplicate sequence
);
```

---

## Technical Stack Updates

### Dependencies to Add

```json
{
  "dependencies": {
    "resend": "^3.0.0"
  }
}
```

### Dependencies to Remove

- No n8n client libraries needed

### Environment Variables

```bash
# Updated .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# New: Email Service
RESEND_API_KEY=re_xxxxxxxxxxxx

# Updated: Direct Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
# OR
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
SLACK_CHANNEL_ID=C0XXXXXXXXX

# Removed: N8N_WEBHOOK_SPK_PUBLISHED, N8N_WEBHOOK_PAYMENT_UPDATED
```

---

## User Flow Changes

### Create SPK Flow (Updated)

1. User clicks "Create SPK"
2. **System auto-generates SPK number** (editable field)
3. **Step 1:** Vendor & Project Info
4. **Step 2:** Contract Value & Currency Selection
5. **Step 3:** Dynamic Payment Terms (add/remove as needed)
6. **Step 4:** Review all inputs
7. Saves as draft OR publishes
8. On publish:
   - PDF preview available
   - Shareable link generated
   - **Slack notification sent automatically**
   - User can **optionally send email to vendor**

### Publish SPK Actions

**Automatic:**

- ✅ Update status to "published"
- ✅ Generate PDF
- ✅ Create shareable link
- ✅ Send Slack notification to internal channel

**Optional (User-triggered):**

- 📧 Send email to vendor with PDF link

---

## Implementation Priorities

### Phase 1: Core Updates (Critical)

1. Database migration for payment table structure
2. Dynamic payment form UI
3. SPK number auto-generation logic
4. Remove n8n dependencies

### Phase 2: Integration (High Priority)

5. Resend API integration
6. Slack webhook integration
7. Step form implementation
8. Currency selector

### Phase 3: Enhancement (Medium Priority)

9. PDF template updates for dynamic payments
10. Shareable link access control
11. Created by auto-population
12. Form validation updates

---

## Testing Checklist

### Database

- [ ] Test SPK creation with 1, 2, 3, 5+ payment terms
- [ ] Verify term_order uniqueness constraint
- [ ] Test SPK number uniqueness
- [ ] Verify created_by auto-population

### Forms

- [ ] Test add/remove payment rows
- [ ] Test percentage vs nominal input
- [ ] Test SPK number manual override
- [ ] Test currency selection (IDR, USD, SGD, EUR)
- [ ] Verify step form navigation

### Integrations

- [ ] Test Resend email sending
- [ ] Test Slack notification on publish
- [ ] Test Slack notification on payment update
- [ ] Verify no n8n dependencies

### PDF Generation

- [ ] Test PDF with 1 payment term
- [ ] Test PDF with 5+ payment terms
- [ ] Verify currency display in PDF
- [ ] Test shareable link access

---

## Migration Guide

### For Existing Data

If there's existing data, run migration:

```sql
-- Step 1: Add new columns
ALTER TABLE spk ADD COLUMN created_by_email VARCHAR(255);

-- Step 2: Backfill with placeholder (manual cleanup later)
UPDATE spk SET created_by_email = created_by WHERE created_by_email IS NULL;

-- Step 3: Make NOT NULL
ALTER TABLE spk ALTER COLUMN created_by_email SET NOT NULL;

-- Step 4: Migrate existing payment data
-- This requires manual handling if there are fixed DP/Progress/Final fields
```

### Code Migration

1. Update all `createSPK()` calls to pass dynamic payment array
2. Remove n8n webhook calls: Search codebase for `N8N_WEBHOOK`
3. Add Resend import and replace email logic
4. Add Slack webhook direct calls
5. Update form components for step-based flow

---

## Benefits of Changes

### Simplicity ✨

- Removed external dependency (n8n)
- Direct API calls easier to debug
- Less infrastructure to manage

### Flexibility 💪

- Dynamic payments support any project structure
- Manual override for special cases
- Multiple currencies without conversion complexity

### Production-Ready 🚀

- Resend: Reliable, scalable email service
- Slack: Direct integration, no middleman
- Auto-generation prevents user errors
- Clean separation of automatic vs optional actions

### Future-Proof 🔮

- Easy to add more payment terms
- Easy to add more currencies
- Structure allows for phase 2 enhancements without refactor
- No breaking changes to core architecture

---

## Next Steps

1. **Review** this specification with team
2. **Update** database schema (migration script)
3. **Refactor** form components for step-based flow
4. **Implement** dynamic payment UI
5. **Integrate** Resend and Slack APIs
6. **Test** all updated workflows
7. **Deploy** to staging for UAT

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Status:** ✅ Ready for Implementation
