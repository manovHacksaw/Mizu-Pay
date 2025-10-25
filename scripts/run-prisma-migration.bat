@echo off
echo Running Prisma Database Migration...
echo.

echo Step 1: Pushing schema to database...
npx prisma db push
echo.

echo Step 2: Generating Prisma client...
npx prisma generate
echo.

echo Step 3: Migration complete!
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Test the payment flow
echo 3. Verify txHash field is working
echo.

pause
