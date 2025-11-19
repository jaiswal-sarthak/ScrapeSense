#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
/**
 * Login Configuration Verification Script
 * Run with: node verify-login-config.js
 */

const fs = require('fs');

console.log('🔍 Verifying Login Configuration...\n');

const checks = [];

// Check 1: Verify authOptions has redirect callback
console.log('1️⃣  Checking lib/auth/options.ts for redirect callback...');
try {
  const optionsFile = fs.readFileSync('lib/auth/options.ts', 'utf-8');
  if (optionsFile.includes('async redirect({ url, baseUrl })')) {
    console.log('   ✅ Redirect callback found\n');
    checks.push(true);
  } else {
    console.log('   ❌ Redirect callback NOT found - fix not applied!\n');
    console.log('   Expected to find: async redirect({ url, baseUrl })\n');
    checks.push(false);
  }
} catch (err) {
  console.log('   ❌ Could not read lib/auth/options.ts\n');
  checks.push(false);
}

// Check 2: Verify RLS policies are updated
console.log('2️⃣  Checking supabase/migrations/0001_init.sql for type casting...');
try {
  const sqlFile = fs.readFileSync('supabase/migrations/0001_init.sql', 'utf-8');
  const typecastCount = (sqlFile.match(/auth\.uid\(\)::text/g) || []).length;
  if (typecastCount >= 3) {
    console.log(`   ✅ Found ${typecastCount} type-casted comparisons\n`);
    checks.push(true);
  } else {
    console.log(`   ❌ Found only ${typecastCount} type-casted comparisons (expected 3+)\n`);
    console.log('   RLS policies might not be updated properly\n');
    checks.push(false);
  }
} catch (err) {
  console.log('   ❌ Could not read supabase/migrations/0001_init.sql\n');
  checks.push(false);
}

// Check 3: Verify .env has required variables
console.log('3️⃣  Checking .env file for required variables...');
try {
  const envFile = fs.readFileSync('.env', 'utf-8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  const missingVars = requiredVars.filter(v => !envFile.includes(v));
  
  if (missingVars.length === 0) {
    console.log('   ✅ All required variables present\n');
    requiredVars.forEach(v => {
      const value = envFile.match(new RegExp(`${v}=(.+)`))?.[1]?.substring(0, 20) + '...';
      console.log(`      • ${v}: ${value || '(empty)'}`);
    });
    console.log('');
    checks.push(true);
  } else {
    console.log(`   ❌ Missing variables: ${missingVars.join(', ')}\n`);
    checks.push(false);
  }
} catch (err) {
  console.log('   ❌ Could not read .env file\n');
  console.log('   Create .env by copying env.example and filling in values\n');
  checks.push(false);
}

// Check 4: Verify session callback handles user
console.log('4️⃣  Checking session callback for proper null handling...');
try {
  const optionsFile = fs.readFileSync('lib/auth/options.ts', 'utf-8');
  if (optionsFile.includes('session.user && user')) {
    console.log('   ✅ Session callback has proper null checking\n');
    checks.push(true);
  } else {
    console.log('   ⚠️  Session callback might not have proper null checking\n');
    checks.push(false);
  }
} catch (err) {
  console.log('   ❌ Could not verify session callback\n');
  checks.push(false);
}

// Check 5: Verify pages.signIn is set
console.log('5️⃣  Checking pages.signIn configuration...');
try {
  const optionsFile = fs.readFileSync('lib/auth/options.ts', 'utf-8');
  if (optionsFile.includes('signIn: "/signin"')) {
    console.log('   ✅ Sign in page properly configured\n');
    checks.push(true);
  } else {
    console.log('   ❌ Sign in page not properly configured\n');
    checks.push(false);
  }
} catch (err) {
  console.log('   ❌ Could not verify sign in configuration\n');
  checks.push(false);
}

// Summary
console.log('='.repeat(50));
const passed = checks.filter(c => c).length;
const total = checks.length;

if (passed === total) {
  console.log(`\n✅ All checks passed! (${passed}/${total})\n`);
  console.log('Your login configuration looks correct.\n');
  console.log('Next steps:');
  console.log('1. Run the SQL migration in Supabase Dashboard');
  console.log('2. Restart your dev server (npm run dev)');
  console.log('3. Clear browser cookies for localhost:3000');
  console.log('4. Test login at http://localhost:3000/signin\n');
} else {
  console.log(`\n⚠️  Some checks failed! (${passed}/${total} passed)\n`);
  console.log('Please review the failed checks above and fix them.');
  console.log('Files that should be updated:');
  console.log('• lib/auth/options.ts');
  console.log('• supabase/migrations/0001_init.sql\n');
}

console.log('For detailed troubleshooting, see LOGIN_TROUBLESHOOTING.md\n');
