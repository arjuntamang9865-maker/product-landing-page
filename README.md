# Bobin Foto Product Funnel

Production-ready Next.js funnel for a Cash on Delivery photo product.

## Pages

- `/` Product landing page
- `/checkout` Checkout page
- `/thank-you` Thank you page
- `/api/order` Order submission API

## What the order flow does

1. Customer chooses quantity on the landing page.
2. CTA buttons send the customer to checkout with product data prefilled.
3. Checkout form posts to `/api/order`.
4. The API validates the payload.
5. The order is appended to Google Sheets.
6. A business notification email is sent to `BUSINESS_EMAIL`.
7. A confirmation email is sent to the customer.
8. The customer is redirected to the thank-you page.

If one of the email steps fails after the sheet write, the API returns an error so you can retry the notification flow without losing the order row.

## Environment variables

Create a `.env.local` file from `.env.example`.

Required:

- `NEXT_PUBLIC_SITE_URL`
- `BUSINESS_EMAIL`
- `EMAIL_FROM`
- `BRAND_NAME`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TAB_NAME`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FRONTEND_URL`

Optional:

- `EMAIL_SERVICE_API_KEY`

## Google Spreadsheet setup

1. Create a new Google Sheet.
2. Rename the tab to `sheet 1` or update `GOOGLE_SHEET_TAB_NAME`.
3. Add these headers in row 1:
   - Order ID
   - Date & Time
   - Customer Name
   - Phone Number
   - Email Address
   - Exact Location
   - Product Name
   - Quantity
   - Price Per Piece
   - Total Price
   - Payment Method
   - Order Status
   - Notes
4. Enable filters in row 1.
5. Add data validation dropdown for `Order Status` with:
   - New Order
   - Order Confirmed
   - Order Ongoing
   - Delivered
   - Cancelled
6. Share the sheet with your Google service account email.
7. Copy the sheet ID from the URL and place it in `GOOGLE_SHEET_ID`.
8. Paste the service account private key into `GOOGLE_PRIVATE_KEY`.

## Email setup

This project uses Nodemailer with SMTP.

Recommended Gmail SMTP values:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465` or `587`
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASS=your-app-password`

Set:

- `BUSINESS_EMAIL=bobinfotoproduct@gmail.com`
- `EMAIL_FROM=Bobin Foto Product <bobinfotoproduct@gmail.com>`

The app sends:

1. A business order notification email
2. A customer order received email

## Local development

```bash
npm install
npm run dev
```

## Testing the order flow

1. Open `/`.
2. Click `Purchase Now` or `Order Now`.
3. Fill checkout details.
4. Submit the order.
5. Confirm the thank-you redirect.
6. Check Google Sheets for the new row.
7. Check the business Gmail inbox.
8. Check the customer inbox.

## Deployment on Vercel

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add the environment variables in Vercel.
4. Make sure `FRONTEND_URL` matches your production domain.
5. Deploy.

## Notes

- The hero uses one product image only.
- The showcase section uses the full image set.
- Reel section is omitted because no reel links were provided.
- Delivery is free inside Chitwan and Rs. 170 outside Chitwan.
