# 🚀 QUICK ACTION GUIDE

Read this first: `START_HERE.md`

---

## Your Action Plan (Copy & Paste)

### STEP 1: Supabase Migration
**Time: 5 minutes**

1. Open: https://app.supabase.com
2. Select project
3. SQL Editor → New Query
4. Copy-paste entire file: `supabase/migrations/0001_init.sql`
5. Click RUN
6. ✅ See "Query executed successfully"

---

### STEP 2: Restart Server
**Time: 1 minute**

```bash
# In terminal:
Ctrl+C
npm run dev
# Wait for "ready - started server"
```

---

### STEP 3: Clear Browser
**Time: 2 minutes**

```
DevTools (F12) → Application → Cookies
Delete all localhost:3000
Delete all Local Storage for localhost:3000
Close DevTools
Ctrl+Shift+R (hard refresh)
```

---

### STEP 4: Test
**Time: 3 minutes**

Go to: `http://localhost:3000/signin`

**EMAIL TEST:**
- Enter: any email
- Click: Send link
- Check: Terminal for link (Nodemailer test account)
- Click: Magic link in terminal
- See: ✅ Dashboard (not signin!)

**GOOGLE TEST:**
- Click: "Continue with Google"
- Complete: Google OAuth flow
- See: ✅ Dashboard (not signin!)

---

## Verify It Worked

Run this to check:
```bash
node verify-login-config.js
```

All 5 checks should show ✅

---

## If It Fails

### Most Common: Forgot SQL Migration
Solution: Go back to STEP 1, run the SQL

### Still Stuck?
1. Check: Browser console (F12) for errors
2. Check: Terminal where npm run dev is running
3. Check: Supabase dashboard for new users
4. Read: `LOGIN_TROUBLESHOOTING.md`

---

## TL;DR

| What | Action | When Done |
|------|--------|-----------|
| SQL | Paste & Run in Supabase | ✅ See success message |
| Server | `npm run dev` | ✅ See "ready" message |
| Browser | Clear cache, hard refresh | ✅ Page reloads |
| Test | Try email/Google login | ✅ See dashboard |

---

Done! 🎉
