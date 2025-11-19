# 🔐 Login Issues - Complete Diagnosis & Fixes

## The Problem
You log in → land back on signin page (infinite loop)

## Root Causes Identified & Fixed

### ❌ Issue #1: RLS Policy Type Mismatch
**File**: `supabase/migrations/0001_init.sql`
**Severity**: HIGH
**Status**: ✅ FIXED

**What was wrong:**
```sql
-- WRONG: Direct comparison without type casting
create policy "Users can manage their profile"
    on public.users
    for all
    using (auth.uid() = id)  -- ❌ UUID vs text comparison
```

**Why it breaks:**
- NextAuth uses a custom adapter with the **service role key**
- Service role bypasses RLS but still matters for query structure
- Type mismatch can cause silent failures in edge cases

**What was fixed to:**
```sql
-- CORRECT: Explicit type casting for safe comparison
create policy "Users can manage their profile"
    on public.users
    for all
    using (auth.uid()::text = id::text)  -- ✅ Text comparison
```

---

### ❌ Issue #2: Missing Redirect Callback
**File**: `lib/auth/options.ts`
**Severity**: CRITICAL
**Status**: ✅ FIXED

**What was wrong:**
```typescript
callbacks: {
  async session({ session, user }) {
    if (session.user) {
      session.user.id = user.id;  // ❌ Missing check if user exists
    }
    return session;
  },
  // ❌ NO REDIRECT CALLBACK - NextAuth won't know where to send after login!
  // pages: { signIn: "/signin" } only redirects failed attempts
}
```

**Why it breaks:**
- After email verification, NextAuth has no explicit redirect URL
- Magic link callback doesn't specify `callbackUrl`
- Without a redirect callback, NextAuth might default to `/` or loop back to `/signin`

**What was fixed to:**
```typescript
callbacks: {
  async session({ session, user }) {
    if (session.user && user) {  // ✅ Extra safety check
      session.user.id = user.id;
    }
    return session;
  },
  async redirect({ url, baseUrl }) {  // ✅ NEW: Redirect logic
    // Allows relative callback URLs
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    // Allows callback URLs on the same origin
    else if (new URL(url).origin === baseUrl) return url;
    // Default to dashboard after successful login
    return baseUrl + "/dashboard";  // ✅ Explicit dashboard redirect
  },
}
```

---

## Complete Login Flow (After Fixes)

### Email/Magic Link Flow:
```
1. User enters email + clicks "Send link"
   └─→ signIn("email", { email, redirect: false })
   
2. Magic link sent via Resend
   └─→ User receives email with verification URL
   
3. User clicks magic link
   └─→ Browser navigates to NextAuth callback: /api/auth/callback/email?token=...
   
4. NextAuth verifies token
   └─→ Queries verification_tokens table
   └─→ Token valid → deletes token row
   
5. Create or find user
   └─→ Queries users table for email
   └─→ User not found → creates new user
   └─→ User found → uses existing user
   
6. Create session
   └─→ Inserts into sessions table
   └─→ Sets session-token cookie
   
7. ✅ Redirect callback fires
   └─→ url = "/api/auth/callback/email?token=xxx"
   └─→ baseUrl = "http://localhost:3000"
   └─→ Returns: "http://localhost:3000/dashboard"
   └─→ Browser redirects to /dashboard
   
8. ✅ User sees dashboard
   └─→ Dashboard layout checks session
   └─→ Session exists → renders dashboard
   └─→ NO REDIRECT BACK TO SIGNIN!
```

### Google OAuth Flow:
```
1. User clicks "Continue with Google"
   └─→ signIn("google", { callbackUrl: "/dashboard" })
   
2. Redirects to Google consent screen
   └─→ User approves access
   
3. Google redirects back with auth code
   └─→ /api/auth/callback/google?code=...
   
4. NextAuth exchanges code for tokens
   └─→ Google API returns user info
   
5. Link or create account
   └─→ Creates or links Google account to user
   └─→ Creates/updates user record
   
6. Create session
   └─→ Inserts into sessions table
   └─→ Sets session-token cookie
   
7. ✅ Redirect callback fires
   └─→ Uses callbackUrl: "/dashboard"
   └─→ Returns: "http://localhost:3000/dashboard"
   
8. ✅ User sees dashboard
```

---

## Verification Checklist

### Before Testing:
- [ ] Both SQL migration files are updated
- [ ] Both TypeScript files are updated
- [ ] Browser cache cleared (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- [ ] Cookies cleared for localhost:3000
- [ ] Dev server restarted (`npm run dev`)

### Testing Email Login:
- [ ] Go to http://localhost:3000/signin
- [ ] Enter a test email (e.g., test@example.com)
- [ ] Click "Send link"
- [ ] See message "Check your inbox for a magic link"
- [ ] In Nodemailer test account or Resend, find magic link
- [ ] Click magic link
- [ ] ✅ Should see /dashboard (NOT redirected back to /signin)

### Testing Google Login:
- [ ] Click "Continue with Google"
- [ ] Complete Google OAuth flow
- [ ] ✅ Should redirect to /dashboard (NOT /signin)

### Database Verification:
After successful email login:
1. Go to Supabase dashboard
2. Check `users` table → see your test user created
3. Check `sessions` table → see session with your user_id
4. Check `verification_tokens` table → token should be deleted

---

## If It Still Doesn't Work

### Step 1: Verify Database Tables Exist
```
Supabase Dashboard → SQL Editor → Run:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should include:
- users
- accounts
- sessions
- verification_tokens
- sites
- instructions
- results
- change_logs
- settings
- job_history
- scrape_runs

### Step 2: Check NextAuth Logs
Add to `lib/auth/options.ts`:
```typescript
export const authOptions: NextAuthOptions = {
  // ... existing config ...
  debug: true,  // ✅ ADD THIS for verbose logging
}
```

Look for in console:
- "Verification Token Returned" → Session created successfully
- "JWT Callback" → Token generation
- "Redirect" → Where it's redirecting

### Step 3: Inspect Network Tab (DevTools)
1. Open DevTools → Network tab
2. Go to /signin
3. Enter email and click "Send link"
4. Look for requests to:
   - `/api/auth/signin/email` → POST request
   - Response should be `{ ok: true }` or similar

### Step 4: Check Email Provider
- **Resend**: Open Resend dashboard, verify API key works
- **Nodemailer (dev)**: Check terminal for "Preview magic link: https://..."

### Step 5: Verify Env Vars in Runtime
Create `/app/api/debug/env/route.ts`:
```typescript
export async function GET() {
  return Response.json({
    nextauth_url: process.env.NEXTAUTH_URL,
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_google_id: !!process.env.GOOGLE_CLIENT_ID,
    has_resend_key: !!process.env.RESEND_API_KEY,
  });
}
```

Visit http://localhost:3000/api/debug/env to verify all required vars are loaded.

---

## Files Modified

✅ `supabase/migrations/0001_init.sql`
- Updated RLS policies to use type-safe comparisons

✅ `lib/auth/options.ts`
- Added redirect callback for proper post-login navigation
- Fixed session callback null safety

✅ Created `DEBUG_LOGIN_FIXES.md` (this guide)

---

## Key Takeaways

1. **Redirect Callback is Critical**: Without it, NextAuth doesn't know where to send successful logins
2. **RLS Policies Matter**: Even with service role, they should be type-safe
3. **Clear Cache**: Old session cookies can cause redirect loops
4. **Check Logs**: NextAuth logs (with debug: true) show exactly what's happening
5. **Test Both Auth Methods**: Email and Google often have different failure modes

---

## Production Deployment

Before deploying to production:

1. **Update NEXTAUTH_URL**:
   ```env
   NEXTAUTH_URL=https://yourdomain.com  # NOT localhost!
   ```

2. **Verify Supabase Region**: Ensure Supabase region matches your deployment region

3. **Configure Email Provider**: Use production credentials (Resend, SendGrid, etc.)

4. **Configure OAuth Redirect URIs**:
   - Google: Add `https://yourdomain.com/api/auth/callback/google`
   - GitHub (if added): Add callback URL

5. **Test Full Flow**: Login → Dashboard → Logout → Login again

---

Good luck! 🚀 If you're still stuck, check the database queries and network requests - they'll tell you exactly where it's failing.
