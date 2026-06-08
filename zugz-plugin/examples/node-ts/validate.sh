#!/bin/bash
set -e

echo "🧪 Zugzbot v2.0.0 — Node/TS Demo Validation"
echo "=============================================="

cd "$(dirname "$0")"

# 1. Install dependencies
echo ""
echo "▶ 1. Installing dependencies..."
npm install --silent 2>&1 | tail -5

# 2. TypeScript compilation
echo ""
echo "▶ 2. TypeScript compilation..."
npx tsc --noEmit

# 3. Run tests (should be 4/4 passing)
echo ""
echo "▶ 3. Running tests..."
npx vitest run

# 4. Verify stack profile detection would work
echo ""
echo "▶ 4. Verifying stack profile is detectable..."
node -e "
const path = require('path');
const fs = require('fs');
const rootDir = process.cwd();

// Check for files that would match node-typescript profile
const hasPackageJson = fs.existsSync(path.join(rootDir, 'package.json'));
const hasTsconfig = fs.existsSync(path.join(rootDir, 'tsconfig.json'));
const hasVitestConfig = fs.existsSync(path.join(rootDir, 'vitest.config.ts'));

console.log('  package.json: ' + (hasPackageJson ? '✓' : '✗'));
console.log('  tsconfig.json: ' + (hasTsconfig ? '✓' : '✗'));
console.log('  vitest.config.ts: ' + (hasVitestConfig ? '✓' : '✗'));

if (hasPackageJson && hasTsconfig) {
  console.log('  → Detected stack: node-typescript');
  process.exit(0);
} else {
  console.log('  ✗ Stack detection would fail');
  process.exit(1);
}
"

echo ""
echo "✅ Demo validation complete!"
echo ""
echo "Próximos pasos:"
echo "  1. opencode .       (abre OpenCode en este proyecto)"
echo "  2. Habla con @zugzbot: 'agrega una función calculateDiscount'"
echo ""
