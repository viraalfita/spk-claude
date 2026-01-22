# SPK Creator - Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Pre-Installation

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] At least 500MB free disk space
- [ ] Text editor installed (VS Code, etc.)
- [ ] Git installed (optional, for version control)

## ✅ Installation

- [ ] Repository cloned or downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] No errors in installation output

## ✅ Supabase Setup

### Project Creation
- [ ] Supabase account created
- [ ] New project created with name and region
- [ ] Project fully initialized (not loading)
- [ ] Database password saved securely

### Database Schema
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Ran `database/schema.sql` successfully
- [ ] All 3 tables created: `spk`, `payment`, `vendor`
- [ ] Verified tables in Table Editor

### Sample Data (Optional)
- [ ] Ran `database/seed.sql` in SQL Editor
- [ ] 3 sample SPKs created
- [ ] Payment records created for each SPK
- [ ] 3 vendor records created

### API Keys
- [ ] Project URL copied
- [ ] Anon public key copied
- [ ] Service role key copied
- [ ] Keys stored securely (not committed to git)

## ✅ Environment Configuration

- [ ] `.env.local` file created (copied from `.env.local.example`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] All values are non-empty strings
- [ ] No trailing spaces or quotes

## ✅ Application Testing

### Development Server
- [ ] Server starts without errors (`npm run dev`)
- [ ] Home page loads at `http://localhost:3000`
- [ ] No console errors in browser
- [ ] Both dashboard cards visible and clickable

### Admin Dashboard
- [ ] Dashboard page loads
- [ ] Stats cards show correct counts
- [ ] Sample SPKs visible (if seed data loaded)
- [ ] "Create New SPK" button works

### Create SPK
- [ ] Create form loads without errors
- [ ] All input fields render correctly
- [ ] Payment percentage calculation works
- [ ] Form validation works (try submitting empty)
- [ ] Successfully creates SPK in database
- [ ] Redirects to dashboard after creation
- [ ] New SPK appears in dashboard list

### SPK Detail View
- [ ] Clicking "View Details" opens detail page
- [ ] All SPK information displays correctly
- [ ] Payment tracking section shows 3 payment terms
- [ ] Badges show correct status colors
- [ ] "Back to Dashboard" link works

### Publish SPK
- [ ] "Publish SPK" button appears on draft SPKs
- [ ] Confirmation dialog appears
- [ ] Status changes to "published" after confirmation
- [ ] Button disappears after publishing
- [ ] Page refreshes with new status

### Payment Update
- [ ] "Mark as Paid" button appears on pending payments
- [ ] Clicking button shows payment form
- [ ] Date input works
- [ ] Payment reference input works
- [ ] Can save payment update
- [ ] Status badge updates to "paid"
- [ ] Paid date displays correctly
- [ ] Payment reference displays correctly

### PDF Generation
- [ ] "Download PDF" button visible
- [ ] Clicking button downloads PDF file
- [ ] PDF opens successfully
- [ ] PDF contains correct SPK information
- [ ] PDF formatting looks professional
- [ ] Filename is `SPK-XXXX-XXX.pdf`

### Vendor Portal
- [ ] Vendor portal page loads
- [ ] Sample SPK displays
- [ ] Payment status badges show correctly
- [ ] Read-only (no edit buttons)
- [ ] Download PDF button works

## ✅ Optional: n8n Integration

- [ ] n8n instance running (local or cloud)
- [ ] SPK Published webhook created in n8n
- [ ] Payment Updated webhook created in n8n
- [ ] Webhook URLs added to `.env.local`
- [ ] Test webhook by publishing SPK
- [ ] Slack/Email notification received
- [ ] Test webhook by updating payment
- [ ] Payment notification received

## ✅ Code Quality

- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All pages render without console errors
- [ ] Mobile responsive (test on mobile viewport)

## ✅ Security

- [ ] `.env.local` added to `.gitignore`
- [ ] Service role key never exposed to client
- [ ] RLS policies enabled in Supabase
- [ ] No sensitive data in git repository

## ✅ Production Ready (Optional)

### Pre-Deployment
- [ ] Environment variables configured in hosting platform
- [ ] Database has RLS policies configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] Production build runs (`npm run start`)
- [ ] Authentication added (if required)
- [ ] Error monitoring configured (Sentry, etc.)

### Post-Deployment
- [ ] Application accessible via public URL
- [ ] All features work in production
- [ ] SSL certificate active (HTTPS)
- [ ] Database connection working
- [ ] PDF generation works in production
- [ ] Webhooks configured with production URLs

## 🐛 Common Issues

### "Missing Supabase environment variables"
**Solution:** Restart dev server after creating `.env.local`

### "relation 'spk' does not exist"
**Solution:** Run `database/schema.sql` in Supabase SQL Editor

### npm install fails with ENOSPC
**Solution:**
```bash
npm cache clean --force
# Free up disk space
npm install
```

### PDF download fails
**Solution:**
```bash
npm install @react-pdf/renderer --save
```

### Cannot read properties of undefined
**Solution:** Check that Supabase credentials are correct and database tables exist

## 📋 Deployment Platforms

### Vercel (Recommended)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variables added
- [ ] Build settings: Next.js framework detected
- [ ] Deploy successful

### Railway
- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Deploy successful

### Other Platforms
- [ ] Platform supports Next.js 14 App Router
- [ ] Environment variables configured
- [ ] Build command: `npm run build`
- [ ] Start command: `npm run start`

## 📞 Support

If you're stuck on any step:

1. Check the [README.md](README.md) for detailed documentation
2. Review the [SETUP.md](SETUP.md) for step-by-step guide
3. Verify all environment variables are set correctly
4. Check Supabase logs for database errors
5. Check browser console for frontend errors
6. Open an issue on GitHub with error details

## ✨ Success!

When all checkboxes are complete:

- ✅ Development environment is fully functional
- ✅ Can create, view, and manage SPKs
- ✅ Payment tracking works
- ✅ PDF generation works
- ✅ Ready for testing or production deployment

**Next Steps:**
- Customize the design to match your brand
- Add authentication for production use
- Set up monitoring and error tracking
- Configure backup strategy for database
- Document any custom modifications
