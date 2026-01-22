# Quick Setup Guide

This guide will help you get the SPK Creator app up and running in minutes.

## Step 1: Install Dependencies

First, clear disk space if needed, then install dependencies:

```bash
npm install
```

If you encounter disk space issues:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `spk-creator`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Click "Create new project" and wait 2-3 minutes

### Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ Keep this secret!)

### Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)

You should see: "Success. No rows returned"

### Add Sample Data (Optional)

1. Still in **SQL Editor**, click **New Query**
2. Copy the entire contents of `database/seed.sql`
3. Paste and **Run**

This creates 3 sample SPKs with payment data.

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in your text editor

3. Replace the placeholder values with your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: n8n webhooks (leave empty for now)
N8N_WEBHOOK_SPK_PUBLISHED=
N8N_WEBHOOK_PAYMENT_UPDATED=
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the Application

### Test Admin Dashboard

1. Click **Admin Dashboard** on the home page
2. You should see the sample SPKs if you ran `seed.sql`
3. Click **Create New SPK**
4. Fill in the form:
   - Vendor Name: `Test Vendor`
   - Project Name: `Test Project`
   - Contract Value: `50000000`
   - Start Date: Today's date
   - Click **Create SPK (Draft)**
5. You should be redirected to the dashboard with your new SPK

### Test SPK Detail View

1. Click **View Details** on any SPK
2. You should see:
   - Vendor information
   - Project details
   - Contract value
   - Payment tracking with 3 payment terms
3. Try clicking **Mark as Paid** on a payment
4. Enter payment date and reference
5. Click **Confirm Payment**

### Test Publish SPK

1. On a draft SPK detail page
2. Click **Publish SPK**
3. Confirm the action
4. Status should change to "published"

### Test PDF Generation

1. On any SPK detail page
2. Click **Download PDF**
3. A PDF should download with the SPK details

### Test Vendor Dashboard

1. Go back to home page
2. Click **Vendor Portal**
3. You'll see a demo view with sample SPK
4. This is a read-only view for vendors

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure `.env.local` exists in the project root
- Check that all three Supabase variables are set
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Error: "relation 'spk' does not exist"

- You haven't run the database schema
- Go to Supabase SQL Editor and run `database/schema.sql`

### Payments not showing

- Make sure you created the `payment` table via `schema.sql`
- When creating an SPK, payment records are automatically created
- Check Supabase Table Editor to verify data

### PDF generation fails

- Install missing dependency: `npm install @react-pdf/renderer`
- Restart the dev server

## Next Steps

### Set Up n8n Notifications (Optional)

1. Install n8n locally or use n8n cloud
2. Create webhook workflows:
   - SPK Published: Sends Slack/Email notification
   - Payment Updated: Sends status update
3. Add webhook URLs to `.env.local`
4. Test by publishing an SPK or updating payment

### Deploy to Production

See [README.md](README.md#deployment) for deployment instructions.

### Customize

- Modify PDF template in `lib/pdf/spk-template.tsx`
- Update currency format in `lib/utils.ts`
- Add authentication (Supabase Auth)
- Customize UI components in `components/ui/`

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run in Supabase SQL Editor:
# - database/schema.sql (create tables)
# - database/seed.sql (sample data)
```

### Useful URLs

- Admin Dashboard: `http://localhost:3000/dashboard`
- Create SPK: `http://localhost:3000/dashboard/create`
- Vendor Portal: `http://localhost:3000/vendor`
- Supabase Dashboard: `https://supabase.com/dashboard`

### File Structure

```
app/
  dashboard/          Admin pages
  vendor/            Vendor portal
  actions/           Server actions (create SPK, update payment)
  api/pdf/           PDF generation endpoint

components/
  ui/                shadcn/ui components
  spk-create-form.tsx
  payment-status-update.tsx
  publish-spk-button.tsx

database/
  schema.sql         Database tables
  seed.sql           Sample data

lib/
  supabase/          Database connection
  pdf/               PDF templates
  types.ts           TypeScript types
  utils.ts           Helper functions
```

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the [PRD.md](PRD.md) for feature specifications
- Open an issue on GitHub
