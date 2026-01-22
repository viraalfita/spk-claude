# SPK Creator - Work Order Management System

A digital SPK (Surat Perintah Kerja / Work Order) creation and payment tracking system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **SPK Creation**: Create and manage work orders with vendor and project details
- **Payment Tracking**: Track payment milestones (Down Payment, Progress Payment, Final Payment)
- **PDF Generation**: Generate official SPK PDF documents
- **Admin Dashboard**: Manage all SPKs and update payment statuses
- **Vendor Portal**: Read-only access for vendors to view their SPKs and payment status
- **n8n Integration**: Automated notifications via webhooks (Slack, Email)
- **Responsive Design**: Mobile-friendly interface using shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: @react-pdf/renderer
- **Form Handling**: React Hook Form + Zod
- **Automation**: n8n webhooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- n8n instance (optional, for notifications)

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

# n8n Webhook URLs (optional)
N8N_WEBHOOK_SPK_PUBLISHED=https://your-n8n-instance.com/webhook/spk-published
N8N_WEBHOOK_PAYMENT_UPDATED=https://your-n8n-instance.com/webhook/payment-updated
```

   Find your Supabase keys:
   - Go to Project Settings > API
   - Copy `URL`, `anon public` key, and `service_role` key

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

## Core Workflows

### 1. Create and Publish SPK

1. Admin navigates to Dashboard
2. Clicks "Create New SPK"
3. Fills in vendor, project, and payment details
4. Saves as draft
5. Reviews and publishes
6. System generates PDF and triggers n8n webhook
7. Vendor receives email notification

### 2. Update Payment Status

1. Admin opens SPK detail page
2. Finds the payment term (DP, Progress, Final)
3. Clicks "Mark as Paid"
4. Enters payment date and reference
5. Confirms update
6. System triggers n8n webhook
7. Vendor receives payment confirmation

### 3. Vendor Views SPK

1. Vendor receives email with access link
2. Opens vendor dashboard
3. Views list of assigned SPKs
4. Checks payment status
5. Downloads PDF if needed

## Database Schema

### Tables

- **spk**: Work order records
- **payment**: Payment milestone records
- **vendor**: Vendor information (optional)

See `database/schema.sql` for complete schema definition.

## API Routes

- `GET /api/pdf/[id]`: Generate and download SPK PDF

## Server Actions

- `createSPK`: Create new SPK record
- `publishSPK`: Publish SPK and trigger notifications
- `getSPKList`: Fetch all SPKs
- `getSPKWithPayments`: Fetch SPK with payment details
- `updatePaymentStatus`: Update payment status and trigger notifications

## n8n Integration

Configure n8n webhooks for automated notifications:

1. **SPK Published**: Sends Slack message + email to vendor
2. **Payment Updated**: Notifies vendor of payment status change

Example webhook payload (SPK Published):

```json
{
  "spkNumber": "SPK-2026-001",
  "vendorName": "PT Vendor Jaya",
  "vendorEmail": "vendor@example.com",
  "projectName": "Office Renovation",
  "contractValue": 100000000,
  "currency": "IDR"
}
```

## Customization

### Update Currency Format

Edit `lib/utils.ts`:

```typescript
export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
```

### Modify PDF Template

Edit `lib/pdf/spk-template.tsx` to customize the PDF layout and styling.

### Add Authentication

Currently uses basic token-based access. To add proper authentication:

1. Set up Supabase Auth
2. Update RLS policies in `database/schema.sql`
3. Add auth middleware to protected routes

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- Railway
- Netlify
- AWS Amplify

Ensure platform supports:
- Next.js 14 App Router
- Server-side rendering
- Environment variables

## Troubleshooting

### "Missing Supabase environment variables"

Ensure `.env.local` exists with correct Supabase credentials.

### PDF generation fails

Check that `@react-pdf/renderer` is properly installed:

```bash
npm install @react-pdf/renderer
```

### Disk space error during npm install

Clear npm cache:

```bash
npm cache clean --force
npm install
```

## Contributing

This is a proof of concept project. For production use:

- Add proper authentication
- Implement proper error handling
- Add input validation with Zod schemas
- Add unit and integration tests
- Implement audit logging
- Add file upload for attachments
- Enhance security (CSRF protection, rate limiting)

## License

MIT

## Support

For issues or questions, please open an issue in the GitHub repository.
