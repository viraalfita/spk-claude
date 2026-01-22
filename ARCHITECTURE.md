# SPK Creator - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Home Page  │  │    Admin     │  │   Vendor     │         │
│  │              │  │  Dashboard   │  │   Portal     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
│                    Next.js App Router                           │
│                    (React Components)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌────────────────┐                 │
│  │ Server Actions │◄────────┤  API Routes    │                 │
│  ├────────────────┤         ├────────────────┤                 │
│  │ • createSPK    │         │ • PDF Gen      │                 │
│  │ • publishSPK   │         │   /api/pdf/[id]│                 │
│  │ • getSPKList   │         └────────────────┘                 │
│  │ • updatePayment│                                             │
│  └────────┬───────┘                                             │
│           │                                                     │
│           ▼                                                     │
│  ┌────────────────┐                                             │
│  │   Supabase     │                                             │
│  │    Client      │                                             │
│  └────────┬───────┘                                             │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │            Supabase PostgreSQL                    │           │
│  ├──────────────────────────────────────────────────┤           │
│  │                                                   │           │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐        │           │
│  │  │   SPK   │───┤ Payment │   │ Vendor  │        │           │
│  │  │  Table  │   │  Table  │   │  Table  │        │           │
│  │  └─────────┘   └─────────┘   └─────────┘        │           │
│  │                                                   │           │
│  │  • Row Level Security (RLS)                      │           │
│  │  • Triggers & Functions                          │           │
│  │  • Indexes                                        │           │
│  │                                                   │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐          ┌────────────────┐                │
│  │  n8n Webhooks  │          │  PDF Generator │                │
│  ├────────────────┤          ├────────────────┤                │
│  │ • SPK Published│          │ @react-pdf     │                │
│  │ • Payment      │          │ • Template     │                │
│  │   Updated      │          │ • Rendering    │                │
│  └────────┬───────┘          └────────────────┘                │
│           │                                                     │
│           ▼                                                     │
│  ┌────────────────┐                                             │
│  │ Slack / Email  │                                             │
│  │ Notifications  │                                             │
│  └────────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Create SPK Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ SPK Create Form │ (Client Component)
└────────┬────────┘
         │ Form Submit
         ▼
┌─────────────────┐
│  createSPK()    │ (Server Action)
└────────┬────────┘
         │
         ├─► Calculate payment amounts
         │
         ├─► Insert SPK record
         │   └─► Supabase INSERT INTO spk
         │
         └─► Create payment records (3x)
             └─► Supabase INSERT INTO payment
                 └─► Returns SPK ID
                     │
                     ▼
            ┌─────────────────┐
            │ Redirect to     │
            │   Dashboard     │
            └─────────────────┘
```

### 2. Publish SPK Flow

```
User Click "Publish"
    │
    ▼
┌─────────────────┐
│ Confirmation    │ (Client Dialog)
│    Dialog       │
└────────┬────────┘
         │ Confirm
         ▼
┌─────────────────┐
│  publishSPK()   │ (Server Action)
└────────┬────────┘
         │
         ├─► Update SPK status to "published"
         │   └─► Supabase UPDATE spk
         │
         └─► Trigger n8n webhook
             └─► POST to N8N_WEBHOOK_SPK_PUBLISHED
                 └─► n8n workflow
                     │
                     ├─► Send Slack notification
                     └─► Send email to vendor
```

### 3. Update Payment Flow

```
User Click "Mark as Paid"
    │
    ▼
┌─────────────────┐
│ Payment Form    │ (Client Component)
│ • Date          │
│ • Reference     │
└────────┬────────┘
         │ Submit
         ▼
┌──────────────────┐
│ updatePayment    │ (Server Action)
│    Status()      │
└────────┬─────────┘
         │
         ├─► Update payment record
         │   └─► Supabase UPDATE payment
         │
         └─► Trigger n8n webhook
             └─► POST to N8N_WEBHOOK_PAYMENT_UPDATED
                 └─► n8n workflow
                     │
                     └─► Notify vendor of payment
```

### 4. PDF Generation Flow

```
User Click "Download PDF"
    │
    ▼
┌─────────────────┐
│ GET /api/pdf/   │ (API Route)
│     [spkId]     │
└────────┬────────┘
         │
         ├─► Fetch SPK with payments
         │   └─► getSPKWithPayments()
         │
         ├─► Render PDF template
         │   └─► @react-pdf/renderer
         │       └─► SPKPDFTemplate component
         │
         └─► Return PDF buffer
             └─► Content-Type: application/pdf
                 └─► Browser downloads file
```

## Component Architecture

### Page Components (Server Components)

```
app/
├── page.tsx                    # Home - Static
├── dashboard/
│   ├── page.tsx                # Dashboard - Fetches SPK list
│   ├── create/
│   │   └── page.tsx            # Create - Renders form
│   └── spk/[id]/
│       └── page.tsx            # Detail - Fetches SPK + payments
└── vendor/
    └── page.tsx                # Vendor - Read-only view
```

### Client Components

```
components/
├── spk-create-form.tsx         # Form with state management
├── payment-status-update.tsx   # Inline editor
└── publish-spk-button.tsx      # Action button
```

### Utility Modules

```
lib/
├── utils.ts                    # Helper functions
│   ├── cn()                    # Class name merger
│   ├── formatCurrency()        # Number → Currency
│   ├── formatDate()            # Date → Localized string
│   └── generateSPKNumber()     # Auto SPK number
│
├── types.ts                    # TypeScript definitions
│   ├── SPK                     # SPK interface
│   ├── Payment                 # Payment interface
│   ├── Vendor                  # Vendor interface
│   └── Form data types         # Form interfaces
│
└── supabase/
    ├── client.ts               # Browser client
    ├── server.ts               # Server client (admin)
    └── types.ts                # Database types
```

## Database Relationships

```
┌─────────────────────────────────────────┐
│                  SPK                     │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ spk_number (UNIQUE)                      │
│ vendor_name                              │
│ vendor_email                             │
│ project_name                             │
│ contract_value                           │
│ status (draft|published)                 │
│ ...                                      │
└───────────┬─────────────────────────────┘
            │
            │ 1:N
            │
            ▼
┌─────────────────────────────────────────┐
│                Payment                   │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ spk_id (FK) ──────────────────────┐     │
│ term (dp|progress|final)          │     │
│ amount                             │     │
│ percentage                         │     │
│ status (pending|paid|overdue)     │     │
│ paid_date                          │     │
│ payment_reference                  │     │
└────────────────────────────────────┘     │
                                           │
┌──────────────────────────────────────────┘
│
│ Optional N:1
│
▼
┌─────────────────────────────────────────┐
│                Vendor                    │
├─────────────────────────────────────────┤
│ id (PK)                                  │
│ name                                     │
│ email                                    │
│ phone                                    │
│ access_token                             │
└─────────────────────────────────────────┘
```

## Security Architecture

### Row Level Security (RLS)

```
┌─────────────────────────────────────────┐
│          Authenticated Users             │
│        (Internal Admin Staff)            │
└───────────────┬─────────────────────────┘
                │
                │ Full CRUD Access
                ▼
    ┌───────────────────────┐
    │      SPK Table        │
    │    Payment Table      │
    │    Vendor Table       │
    └───────────────────────┘

┌─────────────────────────────────────────┐
│            Vendor Users                  │
│      (vendor_email matches JWT)          │
└───────────────┬─────────────────────────┘
                │
                │ Read-Only Access
                ▼
    ┌───────────────────────┐
    │   SPK Table (own)     │
    │ Payment Table (own)   │
    └───────────────────────┘
```

### API Security

- Client-side: Uses anon key (safe for public)
- Server-side: Uses service role key (bypasses RLS)
- Service role key: Never exposed to client
- Environment variables: Not committed to repo

## State Management

### Server State
- Fetched via Server Actions
- Cached by Next.js (automatic)
- Revalidated on mutation
- No client-side cache needed

### Client State
- Form state: React useState
- Form validation: Built-in HTML5
- Loading states: Local component state
- No global state management needed

## Performance Optimizations

1. **Server Components**: Default rendering mode
2. **Client Components**: Only where interactivity needed
3. **Database Indexes**: On frequently queried columns
4. **Connection Pooling**: Handled by Supabase
5. **PDF Generation**: On-demand (not pre-generated)
6. **Image Optimization**: Next.js automatic (if images added)

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│            Vercel Edge Network          │
│         (or other hosting platform)      │
└───────────────┬─────────────────────────┘
                │
                ├─► Static pages (Home)
                ├─► Server-rendered pages (Dashboard, Detail)
                ├─► API routes (/api/pdf)
                └─► Server Actions (createSPK, etc.)
                    │
                    ▼
        ┌───────────────────────┐
        │   Supabase Cloud      │
        │   (PostgreSQL)        │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   n8n Instance        │
        │   (Self-hosted/Cloud) │
        └───────────────────────┘
```

## Technology Decisions

### Why Next.js 14?
- App Router for modern React patterns
- Server Components reduce client bundle
- Server Actions simplify data mutations
- Built-in optimizations (images, fonts, etc.)
- Great developer experience

### Why Supabase?
- PostgreSQL with generous free tier
- Built-in authentication (ready to use)
- Row Level Security for data protection
- Real-time capabilities (future feature)
- Easy setup and deployment

### Why @react-pdf/renderer?
- Server-side PDF generation
- React component syntax
- No external dependencies (like Puppeteer)
- Lightweight and fast
- Full styling control

### Why shadcn/ui?
- Copy-paste components (no dependencies)
- Built on Radix UI (accessible)
- Customizable with Tailwind
- TypeScript support
- Modern design

## Scalability Considerations

### Current Limits (PoC)
- Database: Supabase free tier (500MB, 2GB bandwidth)
- Concurrent users: Tested for small team
- File storage: Not implemented yet
- PDF generation: Synchronous (OK for <100 PDFs/day)

### Scale-Up Path
1. Upgrade Supabase plan for more resources
2. Add Redis for caching
3. Queue PDF generation (BullMQ, etc.)
4. Implement pagination for large lists
5. Add CDN for static assets
6. Database read replicas for queries
7. Horizontal scaling via containers

## Monitoring & Observability

### Recommended Setup
- **Error Tracking**: Sentry or similar
- **Analytics**: Vercel Analytics or Google Analytics
- **Logging**: Supabase logs + custom logging
- **Performance**: Web Vitals tracking
- **Uptime**: Uptime monitoring service

### Key Metrics to Track
- SPK creation time
- PDF generation time
- Database query performance
- Webhook delivery success rate
- Page load times
- Error rates

## Backup & Recovery

### Database Backups
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backup via pg_dump

### Disaster Recovery Plan
1. Database restore from Supabase backup
2. Redeploy application from git
3. Reconfigure environment variables
4. Test critical workflows
5. Notify users if downtime occurred

## Future Architecture Enhancements

### Phase 2 (Potential)
- Real-time payment updates (Supabase Realtime)
- File upload for attachments (Supabase Storage)
- Advanced search (PostgreSQL full-text search)
- Audit logging (separate audit table)
- Email queue (for bulk notifications)

### Phase 3 (Production)
- Multi-tenancy support
- Role-based access control (RBAC)
- Advanced analytics dashboard
- Mobile app (React Native)
- API versioning
- Comprehensive test coverage

## Conclusion

The architecture is designed for:
- ✅ Simplicity (easy to understand and maintain)
- ✅ Scalability (can grow with needs)
- ✅ Security (RLS, environment variables)
- ✅ Performance (server components, indexes)
- ✅ Developer experience (TypeScript, modern tools)
- ✅ Cost-effectiveness (free tier friendly)
