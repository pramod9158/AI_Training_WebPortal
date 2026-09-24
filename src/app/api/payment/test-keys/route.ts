import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Allow testing from query params or from process.env
  const keyId =
    searchParams.get('keyId') ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID;
  const keySecret = searchParams.get('keySecret') || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({
      valid: false,
      error: 'Keys are missing. Neither query params nor environment variables provided.',
      configuredKeyId: keyId ? `${keyId.substring(0, 10)}...` : 'NOT SET',
      configuredKeySecret: keySecret ? 'SET (hidden)' : 'NOT SET',
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim(),
    });

    // Test authentication by creating a 1-rupee test order (not charged)
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    });

    return NextResponse.json({
      valid: true,
      status: 'SUCCESS',
      message: 'Razorpay Key ID and Secret are 100% authentic and working properly!',
      testedKeyId: keyId,
      sampleOrderId: testOrder.id,
    });
  } catch (err: any) {
    const description =
      err?.error?.description || err?.description || err?.message || 'Authentication error';
    const statusCode = err?.statusCode || 401;

    return NextResponse.json(
      {
        valid: false,
        status: 'FAILED',
        statusCode,
        error: description,
        testedKeyId: keyId,
        hint:
          statusCode === 401
            ? 'The Key Secret does not match this Key ID on Razorpay. Go to Razorpay Dashboard -> API Keys -> click "Regenerate Key" and copy both the Key ID and the new Secret.'
            : description,
      },
      { status: 200 } // return 200 so browser renders JSON clearly
    );
  }
}
