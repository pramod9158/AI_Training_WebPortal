import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface InvoiceDetails {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  paymentId: string;
  orderId: string;
  amount: number;
  planName?: string;
  paymentDate?: string;
}

/**
 * Builds an ultra-professional, responsive HTML email invoice
 */
export function buildInvoiceHtml(details: InvoiceDetails): string {
  const {
    studentName,
    studentEmail,
    studentPhone,
    paymentId,
    orderId,
    amount,
    planName = '4-Week AI Intensive Cohort',
    paymentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  } = details;

  const invoiceNumber = `WN-INV-${new Date().getFullYear()}-${orderId.slice(-6).toUpperCase()}`;
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://academy.waynautic.com';

  const isCohortPlan = amount >= 9000 || planName.toLowerCase().includes('cohort');
  const isExpertPlan = amount === 5 || planName.toLowerCase().includes('expert');

  const planDuration = isCohortPlan ? '1 Full Year' : isExpertPlan ? '1 Session + Audit' : '1 Session';

  const planInclusions = isCohortPlan
    ? `• 10 Core AI Engineering Modules & 56 Curated Video Topics<br>
       • 4 Weeks of Live Guided Mentorship & Project Code Reviews<br>
       • Architectural Mind Maps, Code Notes & Quiz Mastery<br>
       • Dual Verifiable Certification (Internship + Course Completion)`
    : isExpertPlan
    ? `• 1-on-1 Personalized Session with an AI Industry Expert<br>
       • Personalized Resume & Tech Profile Audit<br>
       • Direct Q&A and Hands-on Guidance on Projects to Build<br>
       • Personalized Upskilling Plan & Curriculum Recommendations`
    : `• 1-on-1 AI Strategy & Doubt-Clearing Consultation Session<br>
       • Personalized AI Learning Roadmap Tailored to Your Profile<br>
       • Custom Upskilling Plan & Curriculum Recommendations<br>
       • Career Transition Advisory for AI/LLM Engineering`;

  const bannerTitle = isCohortPlan
    ? 'Cohort Pass Active — Full Portal Unlocked'
    : isExpertPlan
    ? 'Expert Deep Dive Session Booked'
    : 'Consultation & Roadmap Session Booked';

  const bannerSubtitle = isCohortPlan
    ? `Welcome aboard, <strong>${studentName}</strong>! All 56 topics, video lectures, code notes & mastery quizzes are now accessible.`
    : isExpertPlan
    ? `Thank you, <strong>${studentName}</strong>! Our AI expert team will contact you within 24 hours to schedule your session & profile audit.`
    : `Thank you, <strong>${studentName}</strong>! Our advisory team will contact you within 24 hours to schedule your 1-on-1 roadmap session.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt & Invoice - Waynautic Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #090D16 0%, #0F172A 100%); padding: 32px 36px 28px; text-align: left;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <img src="${portalUrl}/Waynautic%20Logo%20New.png" alt="Waynautic Academy" width="160" style="display: block; max-width: 160px; height: auto; border: 0; outline: none;" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 6px 14px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 30px; color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      Verified Paid
                    </span>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                  Official Enrollment Invoice
                </h1>
                <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
                  Thank you for enrolling with Waynautic Academy. Your payment has been verified.
                </p>
              </div>
            </td>
          </tr>

          <!-- Success Alert Message -->
          <tr>
            <td style="padding: 24px 36px 12px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 16px 20px;">
                <tr>
                  <td style="vertical-align: middle; width: 28px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #10b981; color: #ffffff; font-weight: bold; font-size: 14px; line-height: 24px; text-align: center;">✓</div>
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #065f46;">
                      ${bannerTitle}
                    </p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #047857;">
                      ${bannerSubtitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Metadata Grid -->
          <tr>
            <td style="padding: 12px 36px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; display: block;">Billed To</span>
                    <strong style="font-size: 14px; color: #0f172a; display: block; margin-top: 4px;">${studentName}</strong>
                    <span style="font-size: 12px; color: #475569; display: block; margin-top: 2px;">${studentEmail}</span>
                    ${studentPhone ? `<span style="font-size: 12px; color: #64748b; display: block; margin-top: 2px;">Phone: ${studentPhone}</span>` : ''}
                  </td>
                  <td width="50%" style="vertical-align: top; text-align: right; padding-left: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; display: block;">Invoice Details</span>
                    <span style="font-size: 12px; color: #0f172a; font-weight: 700; display: block; margin-top: 4px;">
                      Invoice #: <span style="font-family: monospace; color: #0284c7;">${invoiceNumber}</span>
                    </span>
                    <span style="font-size: 12px; color: #475569; display: block; margin-top: 2px;">
                      Date: ${paymentDate}
                    </span>
                    <span style="font-size: 12px; color: #475569; display: block; margin-top: 2px;">
                      Method: <strong>Razorpay (Online)</strong>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 16px 36px 8px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0;">
                    <th align="left" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Item Description</th>
                    <th align="center" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Duration</th>
                    <th align="right" style="padding: 10px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 16px 0; vertical-align: top;">
                      <strong style="font-size: 14px; color: #0f172a; display: block;">${planName}</strong>
                      <span style="font-size: 12px; color: #64748b; display: block; margin-top: 4px; line-height: 1.5;">
                        ${planInclusions}
                      </span>
                    </td>
                    <td align="center" style="padding: 16px 0; vertical-align: top; font-size: 13px; color: #475569; font-weight: 600;">
                      ${planDuration}
                    </td>
                    <td align="right" style="padding: 16px 0; vertical-align: top; font-size: 14px; color: #0f172a; font-weight: 700;">
                      ${formattedAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Summary & Totals -->
          <tr>
            <td style="padding: 8px 36px 20px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60%"></td>
                  <td width="40%">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="padding: 6px 0; font-size: 13px; color: #64748b;">Subtotal:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td align="left" style="padding: 6px 0; font-size: 13px; color: #64748b;">GST / Taxes:</td>
                        <td align="right" style="padding: 6px 0; font-size: 13px; color: #059669; font-weight: 600;">Inclusive</td>
                      </tr>
                      <tr style="border-top: 2px solid #0f172a;">
                        <td align="left" style="padding: 12px 0; font-size: 16px; color: #0f172a; font-weight: 800;">Total Paid:</td>
                        <td align="right" style="padding: 12px 0; font-size: 18px; color: #0284c7; font-weight: 800;">${formattedAmount} INR</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Transaction Reference Box -->
          <tr>
            <td style="padding: 0 36px 24px;">
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 14px 18px; font-size: 11px; color: #64748b;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="display: block;">Razorpay Payment ID: <strong style="font-family: monospace; color: #0f172a;">${paymentId}</strong></span>
                      <span style="display: block; margin-top: 4px;">Razorpay Order ID: <strong style="font-family: monospace; color: #0f172a;">${orderId}</strong></span>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="display: inline-block; padding: 4px 10px; background-color: #dcfce7; color: #166534; border-radius: 6px; font-weight: 700;">
                        100% Secure Transaction
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Launch Portal CTA Button -->
          <tr>
            <td style="padding: 0 36px 36px; text-align: center;">
              <a href="${portalUrl}/curriculum" target="_blank" style="display: inline-block; width: 85%; max-width: 380px; padding: 16px 24px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; border-radius: 14px; text-align: center; box-shadow: 0 8px 20px rgba(2, 132, 199, 0.35);">
                Access Curriculum Portal Now →
              </a>
              <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
                Bookmark <a href="${portalUrl}/curriculum" style="color: #0284c7; text-decoration: underline;">waynautic-academy.com/curriculum</a> to resume learning anytime.
              </p>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #090D16; padding: 24px 36px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Have questions or need assistance? Reach out to us on WhatsApp: 
                <a href="https://wa.me/919158998226" style="color: #38bdf8; text-decoration: none; font-weight: 700;">+91 9158998226</a>
                or email <a href="mailto:info@waynautic.com" style="color: #38bdf8; text-decoration: none; font-weight: 700;">info@waynautic.com</a>.
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} Waynautic Academy. All rights reserved.<br>
                Empowering the next generation of Production AI Engineers.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends official invoice via Microsoft Graph API directly from academy@waynautic.com
 */
async function sendInvoiceViaMicrosoftGraph(details: InvoiceDetails): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const senderEmail = process.env.SENDER_EMAIL_ADDRESS || 'academy@waynautic.com';

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure Entra ID credentials missing.');
  }

  // 1. Fetch OAuth2 bearer token from Microsoft identity platform
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(
      `Failed to acquire Microsoft Graph token: ${tokenData.error_description || tokenData.error || 'Unknown error'}`
    );
  }

  // 2. Build invoice HTML and subject
  const htmlContent = buildInvoiceHtml(details);
  const subject = `Enrollment Confirmed & Invoice: 4-Week AI Intensive Cohort (Order #${details.orderId.slice(-6).toUpperCase()})`;

  // 3. Dispatch email via Microsoft Graph /users/{email}/sendMail
  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderEmail)}/sendMail`;
  const payload = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: htmlContent,
      },
      toRecipients: [
        {
          emailAddress: {
            address: details.studentEmail,
            name: details.studentName,
          },
        },
      ],
      from: {
        emailAddress: {
          name: 'Waynautic Academy',
          address: senderEmail,
        },
      },
      replyTo: [
        {
          emailAddress: {
            name: 'Waynautic Academy',
            address: senderEmail,
          },
        },
      ],
    },
    saveToSentItems: 'true',
  };

  const sendRes = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (sendRes.status === 202 || sendRes.ok) {
    const msgId = `graph_${Date.now()}`;
    console.log(
      `[InvoiceEmail] Official invoice sent via Microsoft Graph (${senderEmail}) to ${details.studentEmail}.`
    );
    return { success: true, messageId: msgId };
  }

  const errData = await sendRes.json().catch(() => ({}));
  throw new Error(`Microsoft Graph API error (${sendRes.status}): ${JSON.stringify(errData)}`);
}

/**
 * Dispatches the official invoice email (prioritizes Microsoft Graph API, with SMTP fallback)
 */
export async function sendInvoiceEmail(details: InvoiceDetails): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}> {
  // 1. Try Microsoft Graph API (Official academy@waynautic.com)
  if (process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
    try {
      return await sendInvoiceViaMicrosoftGraph(details);
    } catch (graphErr) {
      console.error('[InvoiceEmail] Microsoft Graph dispatch failed, falling back to SMTP:', graphErr);
    }
  }

  // 2. Fallback to standard SMTP if Graph is not configured or encounters network error
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = process.env.SMTP_SECURE !== 'false';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn(
        `[InvoiceEmail] Neither Microsoft Graph nor SMTP credentials set. Skipping email dispatch for ${details.studentEmail}.`
      );
      return { success: false, skipped: true, error: 'Email service credentials not configured.' };
    }

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
    const htmlContent = buildInvoiceHtml(details);

    const senderEmail = process.env.SENDER_EMAIL_ADDRESS || smtpUser || 'academy@waynautic.com';
    const info = await transporter.sendMail({
      from: {
        name: 'Waynautic Academy',
        address: senderEmail,
      },
      sender: {
        name: 'Waynautic Academy',
        address: senderEmail,
      },
      replyTo: {
        name: 'Waynautic Academy',
        address: senderEmail,
      },
      to: details.studentEmail,
      subject: `Enrollment Confirmed & Invoice: 4-Week AI Intensive Cohort (Order #${details.orderId.slice(-6).toUpperCase()})`,
      html: htmlContent,
    });

    console.log(`[InvoiceEmail] Invoice sent via SMTP fallback to ${details.studentEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[InvoiceEmail] Failed to send invoice to ${details.studentEmail}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}
