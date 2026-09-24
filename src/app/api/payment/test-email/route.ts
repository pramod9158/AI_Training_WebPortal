import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendInvoiceEmail } from '@/lib/emailInvoiceService';

export async function GET(req: NextRequest) {
  const toEmail = req.nextUrl.searchParams.get('to') || process.env.SMTP_USER;

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = process.env.SMTP_SECURE !== 'false';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({
      success: false,
      error: 'SMTP_USER or SMTP_PASS is missing in .env.local',
      config: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser || 'NOT_SET',
        passConfigured: Boolean(smtpPass),
      },
    }, { status: 400 });
  }

  // 1. Verify SMTP Connection
  try {
    const transportConfig = smtpHost.includes('gmail')
      ? {
          service: 'gmail',
          auth: { user: smtpUser, pass: smtpPass },
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        };

    const transporter = nodemailer.createTransport(transportConfig as any);
    await transporter.verify();

    // 2. If 'to' parameter is passed, dispatch a sample invoice
    if (toEmail) {
      const sendResult = await sendInvoiceEmail({
        studentName: 'Pramod (Waynautic Test)',
        studentEmail: toEmail,
        studentPhone: '+91 9158998226',
        paymentId: 'pay_sample_' + Date.now().toString().slice(-8),
        orderId: 'order_sample_' + Date.now().toString().slice(-8),
        amount: 9999,
        planName: '4-Week AI Intensive Cohort',
      });

      return NextResponse.json({
        success: true,
        message: `SMTP connection verified and sample invoice email sent to ${toEmail}!`,
        sendResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP connection verified successfully with Gmail servers!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: errorMsg,
      hint: 'If using Gmail, ensure you are using a 16-character Google App Password (not your regular account login password).',
    }, { status: 500 });
  }
}
