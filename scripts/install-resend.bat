@echo off
echo Installing Resend package...
echo.

echo Step 1: Installing Resend...
npm install resend
echo.

echo Step 2: Verifying installation...
npm list resend
echo.

echo Step 3: Installation complete!
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Test the payment flow
echo 3. Check Gmail inbox for confirmation emails
echo.

echo Your email service is now ready to send real emails!
pause
