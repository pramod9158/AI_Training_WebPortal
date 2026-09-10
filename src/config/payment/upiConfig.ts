/**
 * WAYNAUTIC ACADEMY: MASTER PAYMENT & UPI CONFIGURATION
 * =========================================================================
 * 
 * SECURITY DIRECTIVE:
 * Admin UI editing has been permanently disabled by design.
 * 
 * To change payment details in the future:
 * 1. Edit the UPI ID, payee, amount, etc. in this file (`upiConfig.ts`).
 * 2. Replace `qr-code.jpg` in this same folder (`src/config/payment/qr-code.jpg`)
 *    with your new QR code image.
 * 
 * Both assets live together in this folder:
 * -> src/config/payment/
 * 
 * =========================================================================
 */

import qrCodeStatic from './qr-code.jpg';

export interface UpiPaymentConfig {
  id: string;
  upiId: string;
  payeeName: string;
  amount: number;
  currency: string;
  title: string;
  description: string;
  qrImageUrl: string;
  qrImage: typeof qrCodeStatic;
  isActive: boolean;
  notes: string;
}

export const MASTER_PAYMENT_CONFIG: UpiPaymentConfig = {
  id: 'waynautic_pro_upi',

  // 1. UPI ID / Virtual Payment Address
  upiId: 'pramodkalyan281@ybl',

  // 2. Beneficiary / Merchant Name
  payeeName: 'Pramod Kalyan',

  // 3. Pro Lifetime Course Fee
  amount: 999.00,

  // 4. Currency
  currency: 'INR',

  // 5. Pass Title
  title: 'Waynautic Pro AI Pass (Lifetime Access)',

  // 6. Candidate Instructions
  description: 'Scan with PhonePe, Google Pay, Paytm, BHIM, or any UPI banking app. Enter the 12-digit UTR/Ref number below for instant verification.',

  // 7. Local QR Code Barcode Asset (Loaded from this exact folder)
  qrImage: qrCodeStatic,
  qrImageUrl: typeof qrCodeStatic === 'string' ? qrCodeStatic : (qrCodeStatic as any).src || '/payment/qr-code.jpg',

  isActive: true,
  notes: 'Instant Pro upgrade within 15 minutes of verification.'
};
