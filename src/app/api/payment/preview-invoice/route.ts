import { NextRequest, NextResponse } from 'next/server';
import { buildInvoiceHtml } from '@/lib/emailInvoiceService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name') || 'Pramod Gogadare';
  const email = searchParams.get('email') || 'student@waynautic.com';
  const amount = Number(searchParams.get('amount') || '9999');
  const paymentId = searchParams.get('paymentId') || 'pay_preview_test_123456';
  const orderId = searchParams.get('orderId') || 'order_preview_test_987654';
  const planParam = searchParams.get('plan') || searchParams.get('planName');

  const resolvedPlanName = planParam
    ? planParam
    : amount === 19 || amount === 5
    ? 'Live AI Webinar Session'
    : amount === 1
    ? '1-on-1 AI Consultation & Roadmap'
    : '4-Week AI Intensive Cohort';

  const html = buildInvoiceHtml({
    studentName: name,
    studentEmail: email,
    studentPhone: '+91 9158998226',
    paymentId: paymentId,
    orderId: orderId,
    amount: amount,
    planName: resolvedPlanName,
  });

  // For browser preview, replace cid:waynautic-logo with the public logo path
  const browserHtml = html.replace('cid:waynautic-logo', '/Waynautic%20Logo%20New.png');

  return new NextResponse(browserHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
