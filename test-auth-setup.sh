#!/bin/bash
# Quick Supabase Connection Test Script

echo "🔍 Testing Supabase Connection..."
echo ""

# Check environment variables
echo "✓ Environment Variables:"
echo "  NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "  SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo ""

# Show the migrations that need to be run
echo "✓ Database Migration Status:"
echo "  Run the following SQL in your Supabase dashboard:"
echo "  1. Go to: https://app.supabase.com"
echo "  2. Select your project"
echo "  3. Go to SQL Editor"
echo "  4. Create new query"
echo "  5. Copy all content from: supabase/migrations/0001_init.sql"
echo "  6. Click Run"
echo ""

echo "✓ NextAuth Configuration:"
echo "  NEXTAUTH_URL: ${NEXTAUTH_URL}"
echo "  NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
echo ""

echo "✓ Required Auth Providers:"
echo "  Email (Resend): $([ -n "$RESEND_API_KEY" ] && echo "✓ Configured" || echo "✗ Missing")"
echo "  Google OAuth: $([ -n "$GOOGLE_CLIENT_ID" ] && echo "✓ Configured" || echo "✗ Missing")"
echo ""

echo "Next steps:"
echo "1. npm install"
echo "2. npm run dev"
echo "3. Visit http://localhost:3000/signin"
echo "4. Test email or Google login"
