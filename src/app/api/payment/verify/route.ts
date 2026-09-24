import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendInvoiceEmail } from '@/lib/emailInvoiceService';

export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay key secret not configured on server' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan = 'cohort',
      amount,
      userEmail,
      userName,
      userId,
      phone,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment verification fields' },
        { status: 400 }
      );
    }

    // Cryptographic HMAC SHA-256 signature verification
    const bodyPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(bodyPayload)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Razorpay signature mismatch:', {
        expectedSignature,
        receivedSignature: razorpay_signature,
      });
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // Signature is authentic and valid!
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const numericAmount = amount ? Number(amount) / 100 : plan === 'expert_session' ? 19 : 9999;

    // Record verified transaction in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // 1. Insert into payments table with status 'verified'
      try {
        await supabase.from('payments').insert({
          user_id: userId || null,
          user_email: cleanEmail || 'guest@waynautic.com',
          user_name: userName || (cleanEmail ? cleanEmail.split('@')[0] : 'Candidate'),
          amount: numericAmount,
          currency: 'INR',
          payment_method: 'razorpay',
          transaction_reference: razorpay_payment_id,
          barcode_id: `razorpay_${razorpay_order_id}`,
          status: 'verified',
          verified_at: new Date().toISOString(),
          plan_granted: 'pro',
          notes: `Razorpay Order: ${razorpay_order_id} | Phone: ${phone || 'N/A'} | Plan: ${plan}`,
        });
      } catch (dbErr) {
        console.warn('Could not insert payment into Supabase ledger:', dbErr);
      }

      // 2. Automatically upgrade user_profiles to 'pro' if userId is present
      if (userId) {
        try {
          await supabase
            .from('user_profiles')
            .update({ plan: 'pro', updated_at: new Date().toISOString() })
            .eq('id', userId);
        } catch (profErr) {
          console.warn('Could not update user_profiles in Supabase:', profErr);
        }
      }
    }

    // 3. Automatically dispatch official email invoice
    const studentDisplayName = userName || (cleanEmail ? cleanEmail.split('@')[0] : 'Student');
    sendInvoiceEmail({
      studentName: studentDisplayName,
      studentEmail: cleanEmail,
      studentPhone: phone || undefined,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: numericAmount,
      planName: plan === 'expert_session' ? '1-on-1 AI Strategy Session' : '4-Week AI Intensive Cohort',
    }).catch((emailErr) => {
      console.warn('[InvoiceEmail] Background email send error:', emailErr);
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and access granted successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan,
    });
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
