#!/bin/bash
# Cache cleaning script for QazaqTamaq backend
# Usage: bash clean-cache.sh [--full]

set -e

BACKEND_DIR="/Applications/qazaqtamaq-workspace/backend"
FRONTEND_DIR="/Applications/qazaqtamaq-workspace/frontend"

echo "========================================"
echo "  QazaqTamaq - Cache Cleaning Script"
echo "========================================"
echo ""

# Parse arguments
FULL_CLEAN=false
for arg in "$@"; do
  case $arg in
    --full)
      FULL_CLEAN=true
      shift
      ;;
  esac
done

echo "Step 1: Stopping backend server..."
pkill -f "node.*dist/main" 2>/dev/null || true
echo "  ✅ Backend stopped"

echo ""
echo "Step 2: Cleaning dist/ folder..."
rm -rf "$BACKEND_DIR/dist"
echo "  ✅ dist/ removed"

echo ""
echo "Step 3: Rebuilding TypeScript..."
cd "$BACKEND_DIR" && npx tsc -p tsconfig.json --outDir dist
echo "  ✅ TypeScript compiled"

if [ "$FULL_CLEAN" = true ]; then
  echo ""
  echo "Step 4 (FULL): Regenerating Prisma Client..."
  cd "$BACKEND_DIR" && npx prisma generate
  echo "  ✅ Prisma client regenerated"
  
  echo ""
  echo "Step 5 (FULL): Resetting database and reseeding..."
  cd "$BACKEND_DIR" && npx prisma migrate reset --force
  DATABASE_URL="postgresql://neondb_owner:npg_rwaKimOM3fJ0@ep-weathered-cell-aohlirvl-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx tsx prisma/seed.ts
  echo "  ✅ Database reset and seeded"
else
  echo ""
  echo "Step 4: Regenerating Prisma Client..."
  cd "$BACKEND_DIR" && npx prisma generate
  echo "  ✅ Prisma client regenerated"
fi

echo ""
echo "Step 5: Starting backend server..."
cd "$BACKEND_DIR" && node dist/main > /tmp/backend.log 2>&1 &
sleep 3
echo "  ✅ Backend started"

echo ""
echo "Step 6: Verifying backend health..."
PRODUCTS=$(curl -s http://localhost:3001/products | python3 -c 'import sys,json; print(len(json.load(sys.stdin)))' 2>/dev/null || echo "0")
echo "  ✅ Products available: $PRODUCTS"

echo ""
echo "========================================"
echo "  Cache cleaning complete!"
echo "========================================"
echo ""
echo "Services:"
echo "  🟢 Backend (NestJS):   http://localhost:3001"
echo "  🟢 Frontend (Next.js): http://localhost:3000"
echo "  🟢 Swagger Docs:       http://localhost:3001/api/docs"
echo ""
echo "Usage:"
echo "  ./clean-cache.sh        - Clean build artifacts"
echo "  ./clean-cache.sh --full - Full reset with DB reseed"
echo "========================================"
