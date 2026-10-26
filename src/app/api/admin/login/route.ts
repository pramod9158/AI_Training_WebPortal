import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyServerAdminPasskey, 
  createAdminSessionToken, 
  verifyAdminCredentials,
  isMasterAdminEmail,
  ADMIN_COOKIE_OPTIONS 
} from '@/lib/server/adminAuth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, supabaseToken, email, password } = body || {};

    // 1. Authenticate via Master Administrative Passkey
    if (typeof passkey === 'string' && passkey.trim().length > 0) {
      const isValid = verifyServerAdminPasskey(passkey);

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid administrative security key. Access denied.' },
          { status: 401 }
        );
      }

      // Generate secure signed admin token
      const token = createAdminSessionToken('admin@waynautic.ai');
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Admin authorization granted successfully.', 
          email: 'admin@waynautic.ai',
          user: {
            id: '71192f4b-3df5-4eae-b304-26f426a846ec',
            email: 'admin@waynautic.ai',
            displayName: 'Waynautic Admin',
            role: 'admin',
            plan: 'enterprise'
          }
        },
        { status: 200 }
      );

      // Set HTTP-only secure cookie
      response.cookies.set({
        ...ADMIN_COOKIE_OPTIONS,
        value: token
      });

      return response;
    }

    // 2. Authenticate via Email & Password (Master Admin or Supabase Admin)
    if (typeof email === 'string' && typeof password === 'string' && email.trim().length > 0 && password.trim().length > 0) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Check Master Admin Credentials
      if (isMasterAdminEmail(cleanEmail)) {
        const isMasterValid = verifyAdminCredentials(cleanEmail, cleanPassword);

        if (!isMasterValid) {
          return NextResponse.json(
            { success: false, message: 'Invalid administrative password. Access denied.' },
            { status: 401 }
          );
        }

        const token = createAdminSessionToken(cleanEmail);
        const response = NextResponse.json(
          {
            success: true,
            message: 'Admin authorization granted successfully.',
            email: cleanEmail,
            user: {
              id: '71192f4b-3df5-4eae-b304-26f426a846ec',
              email: cleanEmail,
              displayName: 'Waynautic Admin',
              role: 'admin',
              plan: 'enterprise'
            }
          },
          { status: 200 }
        );

        response.cookies.set({
          ...ADMIN_COOKIE_OPTIONS,
          value: token
        });

        return response;
      }

      // Check if user is an admin in Supabase
      if (supabaseUrl && supabaseKey) {
        const serverSupabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });

        const { data: authData, error: authError } = await serverSupabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (authError || !authData?.user) {
          return NextResponse.json(
            { success: false, message: authError?.message || 'Invalid login credentials.' },
            { status: 401 }
          );
        }

        const { data: profileData } = await serverSupabase
          .from('user_profiles')
          .select('id, display_name, role, plan')
          .eq('id', authData.user.id)
          .single();

        if (profileData?.role !== 'admin') {
          return NextResponse.json(
            { success: false, message: 'Access Denied: Account does not hold administrator privileges.' },
            { status: 403 }
          );
        }

        const token = createAdminSessionToken(cleanEmail);
        const response = NextResponse.json(
          {
            success: true,
            message: 'Admin authorization granted successfully.',
            email: cleanEmail,
            user: {
              id: authData.user.id,
              email: cleanEmail,
              displayName: profileData?.display_name || 'Administrator',
              role: 'admin',
              plan: 'enterprise'
            }
          },
          { status: 200 }
        );

        response.cookies.set({
          ...ADMIN_COOKIE_OPTIONS,
          value: token
        });

        return response;
      }
    }

    // 3. Authenticate via Supabase Auth Token with role check
    if (typeof supabaseToken === 'string' && supabaseToken.trim().length > 0 && supabaseUrl && supabaseKey) {
      const serverSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });

      const { data: userData, error: userError } = await serverSupabase.auth.getUser(supabaseToken);
      if (userError || !userData?.user) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired user session.' },
          { status: 401 }
        );
      }

      // Verify the user has admin role in user_profiles
      const { data: profileData, error: profError } = await serverSupabase
        .from('user_profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profError || profileData?.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Access Denied: Account does not hold administrator privileges.' },
          { status: 403 }
        );
      }

      const adminEmail = userData.user.email || email || 'admin@waynautic.ai';
      const token = createAdminSessionToken(adminEmail);
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Admin authorization granted successfully.', 
          email: adminEmail,
          user: {
            id: userData.user.id,
            email: adminEmail,
            displayName: 'Administrator',
            role: 'admin',
            plan: 'enterprise'
          }
        },
        { status: 200 }
      );

      response.cookies.set({
        ...ADMIN_COOKIE_OPTIONS,
        value: token
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Missing credentials. Provide email/password, passkey, or supabaseToken.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
