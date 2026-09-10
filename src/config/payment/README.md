# Waynautic Academy - Payment Gateway Configuration

This folder is the **exclusive source of truth** for all UPI payment details and QR code barcode assets across Waynautic Academy.

> **Security Policy**: UI-based editing has been completely disabled in the Admin Console. To change the UPI ID or barcode in the future, you must update the files directly in this folder.

---

## Files in this Folder

| File | Purpose |
|------|---------|
| `upiConfig.ts` | Contains the active UPI ID (`upiId`), payee merchant name (`payeeName`), course fee (`amount`), currency, and descriptions. |
| `qr-code.jpg` | The official QR code / barcode image displayed to candidates when upgrading to Pro. |

---

## How to Update in the Future

### 1. To Update the UPI ID or Payee Name
Open `upiConfig.ts` in your code editor and change:
```typescript
upiId: 'your-new-upi-id@bank',
payeeName: 'Your New Payee Name',
amount: 999.00,
```

### 2. To Update the QR Code Image
Simply replace `qr-code.jpg` in this folder (`src/config/payment/qr-code.jpg`) with your new QR code barcode image. Ensure the filename remains `qr-code.jpg` (or update the import name in `upiConfig.ts`).

Once updated, commit and push your changes to git.
