# Email Notifications Setup Guide

Receive detailed change reports via email using Resend!

## Why Resend?

- **Free tier**: 100 emails/day, 3,000/month
- **Fast delivery**: Sub-second email delivery
- **Easy setup**: Just one API key needed
- **Professional**: Custom domains supported

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "AI Monitor")
5. Select **Full Access** or **Sending Access**
6. **Copy the API key** (starts with `re_`)

⚠️ **Important**: Copy the key immediately! You won't be able to see it again.

## Step 3: Configure Your Application

### Add Environment Variables

Add these to your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=AI Monitor <notifications@resend.dev>
```

### Using a Custom Domain (Optional)

If you have a verified domain in Resend:

```env
EMAIL_FROM=AI Monitor <alerts@yourdomain.com>
```

**Note**: The default `onboarding@resend.dev` works for testing, but emails might go to spam.

### Restart Your Application

```bash
npm run dev
```

## Step 4: Configure in Dashboard

1. Go to **Dashboard → Settings**
2. Enter your **Email Address**
3. Click **Test** to verify it works
4. Check your inbox for a test email!
5. Click **Save All Settings**

## What You'll Receive

When changes are detected, you'll get beautiful HTML emails with:

- **Header**: Clear notification with change count
- **Summary**: Site details and instruction
- **Change Details**: Up to 10 recent changes with titles and descriptions
- **Quick Action**: Direct link to your dashboard
- **Responsive**: Looks great on all devices

### Example Email:

```
Subject: 🔔 5 Changes Detected on Product Hunt

━━━━━━━━━━━━━━━━━━
🔔 Change Detected
━━━━━━━━━━━━━━━━━━

5 new changes detected on your monitored site.

Site: Product Hunt
Instruction: Fetch innovative projects with >50 upvotes
Time: 11/19/2025, 3:45:12 PM

Recent Changes:
→ New AI Tool for Code Review
→ Revolutionary Note-Taking App
... [View Dashboard]
```

## Troubleshooting

### "Email service not configured"
- Add `RESEND_API_KEY` to your `.env.local` file
- Restart your development server
- Verify the key starts with `re_`

### Test email not received
- Check your spam/junk folder
- Verify the email address is correct
- Make sure your Resend API key is valid
- Check Resend dashboard for delivery logs

### "Invalid API key"
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Create a new API key if needed

### Emails go to spam
- Verify a custom domain in Resend (recommended)
- Update `EMAIL_FROM` to use your verified domain
- Add SPF, DKIM records (Resend provides these)

## Rate Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- No credit card required

**Pro Tier:**
- 50,000 emails/month for $20
- Custom volume pricing available

## Best Practices

1. **Use a custom domain** for better deliverability
2. **Test regularly** to ensure notifications work
3. **Monitor your quota** in the Resend dashboard
4. **Set alert threshold** wisely to avoid spam

## Verify Domain (Recommended)

For production use, verify your domain:

1. Go to Resend dashboard → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides:
   - **SPF record**: Prevents spoofing
   - **DKIM record**: Verifies authenticity
   - **DMARC record**: Reports issues
5. Wait for verification (usually < 5 minutes)
6. Update `EMAIL_FROM` to use your domain

## Need Help?

- Resend Docs: https://resend.com/docs
- Check delivery logs in Resend dashboard
- Test API key: `curl -X GET https://resend.com/api/emails -H "Authorization: Bearer YOUR_API_KEY"`

## Alternatives

If you prefer not to use Resend, you can:
- Use SendGrid, Mailgun, or Postmark
- Modify `lib/notifications/email.ts` with your provider's API
- Use SMTP (requires more configuration)

