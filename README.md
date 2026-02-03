# SPK Creator - Work Order Management System

A digital SPK (Surat Perintah Kerja / Work Order) creation and payment tracking system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### Core Features

- **Dynamic SPK Creation**: Multi-step form with auto-generated SPK numbers (editable)
- **Flexible Payment Terms**: Support for 1x, 2x, 3x, or more payment terms with add/remove functionality
- **Multiple Currencies**: IDR, USD, SGD, EUR, and more (no automatic conversion)
- **PDF Generation & Sharing**: Generate official SPK PDFs with shareable links
- **Payment Tracking**: Real-time payment status updates with manual marking
- **Admin Dashboard**: Comprehensive SPK and payment management
- **Vendor Portal**: Read-only access for vendors via shareable links

### Integrations

- **Email Notifications**: Direct integration with Resend API (optional, user-triggered)
- **Slack Notifications**: Automatic internal notifications via Slack webhooks
- **PDF Preview**: In-app document preview before sharing

### UX Improvements

- **Step Form**: Clear progress indicator through 4-step SPK creation process
- **Auto-Population**: SPK Maker information automatically captured from user session
- **Responsive Design**: Mobile-friendly interface using shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router with Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: @react-pdf/renderer
- **Email Service**: Resend
- **Notifications**: Slack Webhooks/API
- **Form Handling**: React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Resend API key (for email notifications)
- Slack Webhook URL (for notifications)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd spk-claude
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to the SQL Editor and run the schema from `database/schema.sql`
   - Optionally, run `database/seed.sql` for sample data

4. **Configure environment variables**

   Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update the values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Email Service)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
# OR use Slack Bot Token for more control
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx
SLACK_CHANNEL_ID=C0XXXXXXXXX
```

**Where to get the keys:**

- **Supabase**: Project Settings > API (URL, anon public, service_role)
- **Resend**: Sign up at [resend.com](https://resend.com) > API Keys
- **Slack**: Create Incoming Webhook at [api.slack.com/apps](https://api.slack.com/apps)

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
spk-claude/
├── app/
│   ├── actions/          # Server actions (SPK, Payment operations)
│   ├── api/              # API routes (PDF generation)
│   ├── dashboard/        # Admin dashboard pages
│   │   ├── create/       # SPK creation form
│   │   └── spk/[id]/     # SPK detail page
│   ├── vendor/           # Vendor portal
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── spk-create-form.tsx
│   ├── payment-status-update.tsx
│   └── publish-spk-button.tsx
├── lib/
│   ├── supabase/         # Supabase client configuration
│   │   ├── client.ts     # Client-side
│   │   ├── server.ts     # Server-side
│   │   └── types.ts      # Database types
│   ├── pdf/              # PDF generation templates
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── database/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
└── public/               # Static assets
```

## 📋 Core Workflows

### 1. Create and Publish SPK

1. Admin logs in and navigates to Dashboard
2. Clicks "Create New SPK"
3. System auto-generates SPK number (editable if needed)
4. Fills out multi-step form:
   - **Step 1**: Vendor & Project Details
   - **Step 2**: Contract Value & Currency Selection
   - **Step 3**: Dynamic Payment Terms (add/remove as needed)
   - **Step 4**: Review & Confirm
5. Saves as draft OR publishes immediately
6. On publish:
   - PDF generated and preview available
   - Shareable link created
   - Slack notification sent automatically to internal channel
7. Admin can optionally send email to vendor with PDF link

### 2. Update Payment Status

1. Admin opens SPK detail page
2. Finds the payment term in the list
3. Clicks "Mark as Paid"
4. Enters payment date and reference
5. Confirms update
6. System sends Slack notification automatically
7. Admin can optionally notify vendor via email

### 3. Vendor Views SPK

1. Vendor receives email with shareable link OR accesses public link
2. Opens SPK detail page
3. Views SPK and project details
4. Checks payment status for all terms
5. Can preview or download PDF

## 📊 Database Schema

### Key Tables

- **spk**: Work order records with dynamic structure
  - Auto-generated SPK numbers
  - Multiple currency support
  - Created by info (auto-populated)
- **payment**: Dynamic payment milestone records
  - Flexible term names and ordering
  - Support for percentage or nominal amounts
  - Input type tracking
- **vendor**: Vendor information (optional)

See `database/schema.sql` for complete schema definition.

### Schema Highlights

```sql
-- Dynamic payment support
CREATE TABLE payment (
  id UUID PRIMARY KEY,
  spk_id UUID REFERENCES spk(id),
  term_name VARCHAR(100), -- Not enum, fully flexible
  term_order INTEGER, -- Sequence control
  amount NUMERIC(15, 2),
  percentage NUMERIC(5, 2), -- Optional
  input_type VARCHAR(20), -- 'percentage' or 'nominal'
  ...
);
```

## 🔌 API Routes

- `GET /api/pdf/[id]`: Generate and download SPK PDF (supports shareable links)

## ⚡ Server Actions

- `createSPK`: Create new SPK with dynamic payments
- `publishSPK`: Publish SPK, generate PDF, send notifications
- `getSPKList`: Fetch all SPKs with filtering
- `getSPKWithPayments`: Fetch SPK with all payment details
- `updatePaymentStatus`: Update payment status and notify

## 🔔 Integrations

### Email Notifications (Resend)

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

### Slack Notifications

```typescript
// Direct webhook integration
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: `🎉 New SPK #${spk.spk_number} published for ${spk.vendor_name}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*New SPK Created*\nSPK: ${spk.spk_number}\nVendor: ${spk.vendor_name}\nProject: ${spk.project_name}\nValue: ${formatCurrency(spk.contract_value, spk.currency)}`,
        },
      },
    ],
  }),
});
```

**Events:**

- ✅ SPK Published (automatic)
- ✅ Payment Status Updated (automatic)

## 🎨 Customization

### Currency Support

Add more currencies in `lib/utils.ts`:

```typescript
const currencyFormats: Record<string, { locale: string; currency: string }> = {
  IDR: { locale: "id-ID", currency: "IDR" },
  USD: { locale: "en-US", currency: "USD" },
  SGD: { locale: "en-SG", currency: "SGD" },
  EUR: { locale: "de-DE", currency: "EUR" },
  // Add more as needed
};

export function formatCurrency(
  amount: number,
  currency: string = "IDR",
): string {
  const format = currencyFormats[currency] || currencyFormats.IDR;
  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
  }).format(amount);
}
```

### Modify PDF Template

Edit `lib/pdf/spk-template.tsx` to customize the PDF layout. The template supports dynamic payment terms:

```typescript
// Dynamic payment rendering
{payments.map((payment, index) => (
  <View key={payment.id}>
    <Text>{payment.term_name}</Text>
    <Text>{formatCurrency(payment.amount, spk.currency)}</Text>
  </View>
))}
```

### Authentication

Currently uses basic token-based access. To add proper authentication:

1. Set up Supabase Auth (already configured)
2. Add sign-in/sign-up pages
3. Update RLS policies in `database/schema.sql`
4. Add auth middleware to protected routes

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - Supabase credentials
   - Resend API key
   - Slack webhook URL
4. Deploy

### Other Platforms

- Railway
- Netlify
- AWS Amplify

Ensure platform supports:

- Next.js 14 App Router
- Server-side rendering
- Server Actions
- Environment variables

## 🔧 Troubleshooting

### "Missing Supabase environment variables"

Ensure `.env.local` exists with correct Supabase credentials.

### PDF generation fails

Check that `@react-pdf/renderer` is properly installed:

```bash
npm install @react-pdf/renderer
```

### Email not sending

Verify Resend API key is correct:

```bash
# Test in terminal
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json'
```

### Slack notifications not working

1. Verify webhook URL is correct
2. Test webhook manually:

```bash
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification"}'
```

## 📚 Documentation

- [PRD.md](./PRD.md) - Complete Product Requirements Document
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System Architecture Overview
- [SPECIFICATION_UPDATES.md](./SPECIFICATION_UPDATES.md) - Latest specification changes
- [database/schema.sql](./database/schema.sql) - Database schema with comments

## 🎯 Roadmap

### Phase 1 (Current - PoC) ✅

- Dynamic SPK creation with flexible payment terms
- Multi-currency support
- PDF generation and sharing
- Direct email and Slack integration

### Phase 2 (Planned)

- Approval workflows
- File attachments for supporting documents
- Payment reminders
- Advanced reporting dashboard
- Audit trail

### Phase 3 (Future)

- Digital signatures
- Mobile app
- Multi-language support
- Batch operations
- Advanced analytics

## 🤝 Contributing

This is a proof of concept project. For production use, consider:

- ✅ Proper authentication with session management
- ✅ Comprehensive error handling
- ✅ Input validation with Zod schemas (already partially implemented)
- ✅ Unit and integration tests
- ✅ Audit logging for all actions
- ✅ File upload for payment proofs and attachments
- ✅ Enhanced security (CSRF protection, rate limiting)
- ✅ Database migrations strategy
- ✅ API documentation

## 📄 License

MIT

## 💬 Support

For issues or questions:

- Open an issue in the GitHub repository
- Check [SPECIFICATION_UPDATES.md](./SPECIFICATION_UPDATES.md) for recent changes
- Review [PRD.md](./PRD.md) for detailed specifications

---

**Version:** 1.0  
**Last Updated:** February 3, 2026  
**Status:** Active Development
