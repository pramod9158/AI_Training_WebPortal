import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys are not configured on server' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { plan = 'cohort', email, name, phone, userId } = body;

    // Set price strictly on server in paise (1 INR = 100 paise)
    let amountInPaise = 999900; // ₹9,999
    let description = '4-Week Intensive AI Cohort Program';

    if (plan === 'expert_session') {
      amountInPaise = 1900; // ₹19
      description = '1-on-1 AI Expert Consultation Session';
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        plan,
        email: email || '',
        name: name || '',
        phone: phone || '',
        userId: userId || '',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      description,
      plan,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    const errorDetail =
      err?.error?.description ||
      err?.description ||
      err?.message ||
      'Failed to create Razorpay order';
    return NextResponse.json(
      { error: errorDetail },
      { status: 500 }
    );
  }
}
