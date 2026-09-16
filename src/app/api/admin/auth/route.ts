import { NextRequest, NextResponse } from 'next/server';
import { 
  ADMIN_COOKIE_NAME, 
  verifyAdminSessionToken 
} from '@/lib/server/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No admin session token found.' },
        { status: 401 }
      );
    }

    const { valid, payload } = verifyAdminSessionToken(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { authenticated: false, message: 'Admin session token is invalid or expired.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        authenticated: true, 
        role: payload.role, 
        email: payload.email 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin auth check API error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error while checking auth.' },
      { status: 500 }
    );
  }
}
