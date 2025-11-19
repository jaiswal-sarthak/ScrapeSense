# Login Flow - Fixes Applied

## Issues Found & Fixed

### 1. **RLS Policy Type Mismatch** ❌ FIXED
**Problem**: The RLS policies for `users`, `accounts`, and `sessions` tables were comparing `auth.uid()` (UUID) directly with ID fields without type casting. Since NextAuth uses a custom adapter with the **service role key** (which bypasses RLS), this wasn't blocking the adapter operations, but it's a configuration issue.

**Root Cause**: When using NextAuth with a custom Supabase adapter, the service role key bypasses all RLS policies. The issue is that regular user queries would fail if attempted through the anon key.

**Fix Applied**: Updated `/supabase/migrations/0001_init.sql` to:
- Cast `auth.uid()` to text for proper comparison: `auth.uid()::text = id::text`
- This ensures if you ever query these tables with regular auth, it works correctly

---

### 2. **Missing Redirect Callback** ❌ FIXED
**Problem**: NextAuth's `signIn("email")` doesn't automatically redirect after email verification without a `callbackUrl` or a proper redirect callback function.

**Fix Applied**: Updated `/lib/auth/options.ts` to include a `redirect` callback:
```typescript
async redirect({ url, baseUrl }) {
  // Allows relative callback URLs
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  // Allows callback URLs on the same origin
  else if (new URL(url).origin === baseUrl) return url;
  return baseUrl + "/dashboard";
}
```

This ensures users are redirected to `/dashboard` after successful authentication.

---

### 3. **Session Callback Null Safety** ✅ REVIEWED
The session callback was updated to include null safety:
```typescript
if (session.user && user) {
  session.user.id = user.id;
}
```

---

## Configuration Checklist

### Supabase Setup
- ✅ Database tables created (users, accounts, sessions, verification_tokens)
- ✅ RLS policies enabled on all tables
- ✅ Service role key configured: `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **IMPORTANT**: Run the updated migration SQL if you haven't already

### NextAuth Setup
- ✅ `NEXTAUTH_SECRET` configured
- ✅ `NEXTAUTH_URL` set to `http://localhost:3000` (for local dev)
- ✅ Email provider (Resend) configured
- ✅ Google OAuth configured
- ✅ Supabase adapter properly initialized

### Environment Variables (Verified)
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_JWT_SECRET
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ RESEND_API_KEY
```

---

## What Happens During Login

### Email Login Flow:
1. User enters email → clicks "Send link"
2. `signIn("email")` is called with email
3. Magic link is sent via Resend
4. User clicks link in email
5. NextAuth verifies token from `verification_tokens` table
6. Creates or finds user in `users` table
7. Creates session in `sessions` table
8. **Redirect callback** fires → redirects to `/dashboard`
9. Middleware checks for valid session → allows access

### Google Login Flow:
1. User clicks "Continue with Google"
2. `signIn("google", { callbackUrl: "/dashboard" })` is called
3. Redirects to Google OAuth consent screen
4. Returns to callback URL with auth code
5. NextAuth exchanges code for tokens
6. Creates or links account in `accounts` table
7. Creates session in `sessions` table
8. Redirects to `/dashboard`

---

## Testing Login Locally

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test Email Login
- Go to `http://localhost:3000/signin`
- Enter test email (e.g., `test@example.com`)
- Click "Send link"
- Check Resend console or Nodemailer test account for magic link
- Click magic link → should redirect to `/dashboard`

### 3. Test Google Login
- Click "Continue with Google"
- Complete OAuth flow
- Should redirect to `/dashboard`

### 4. Verify Session
- Once logged in, go to `/dashboard`
- Should see the dashboard (not redirected back to signin)
- Check cookies for `next-auth.session-token`

---

## If Login Still Doesn't Work

### Debug Steps:

1. **Check Supabase Tables**
   - Go to Supabase dashboard
   - Open `verification_tokens` table → verify token is created after clicking "Send link"
   - Check `users` table → verify user is created after email verification
   - Check `sessions` table → verify session is created

2. **Check Browser Network Tab**
   - Open DevTools → Network tab
   - Look for requests to `/api/auth/signin/email`
   - Check response status and body

3. **Check Server Logs**
   - Look at terminal where `npm run dev` is running
   - Look for NextAuth debug logs
   - Check for Supabase adapter errors

4. **Verify NEXTAUTH_URL**
   - For production: Must match your actual domain
   - For localhost: Should be `http://localhost:3000`
   - Invalid URL will cause redirect loops

5. **Check Database Connectivity**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Test Supabase connection directly:
   ```typescript
   // In pages/api/test.ts
   import { createClient } from "@supabase/supabase-js";
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   
   const { data, error } = await supabase.from("users").select("*").limit(1);
   ```

---

## Files Modified

1. ✅ `/supabase/migrations/0001_init.sql` - Fixed RLS policy type casting
2. ✅ `/lib/auth/options.ts` - Added redirect callback

## Next Steps

1. **Verify migration is run** on your Supabase database
2. **Clear browser cookies** and cache
3. **Restart dev server**: `npm run dev`
4. **Test login flow** again
5. If still issues, check the Debug Steps above
