import { NextRequest, NextResponse } from 'next/server';
import { buildInvoiceHtml } from '@/lib/emailInvoiceService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name') || 'Pramod Gogadare';
  const email = searchParams.get('email') || 'student@waynautic.com';
  const amount = Number(searchParams.get('amount') || '9999');

  const html = buildInvoiceHtml({
    studentName: name,
    studentEmail: email,
    studentPhone: '+91 9158998226',
    paymentId: 'pay_preview_test_123456',
    orderId: 'order_preview_test_987654',
    amount: amount,
    planName: '4-Week AI Intensive Cohort',
  });

  // For browser preview, replace cid:waynautic-logo with the public logo path
  const browserHtml = html.replace('cid:waynautic-logo', '/Waynautic%20Logo%20New.png');

  return new NextResponse(browserHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
