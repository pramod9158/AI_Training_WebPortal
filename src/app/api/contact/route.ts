import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName = '', lastName = '', email = '', phone = '', subject = '', message = '' } = body;

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: 'Email and message are required.' },
        { status: 400 }
      );
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Prospective Student';
    const emailSubject = `[Waynautic Lead] ${subject || 'New Contact Request'} - ${fullName}`;
    const targetEmail = 'pramod.gogadare@waynautic.com';
    const senderEmail = process.env.SENDER_EMAIL_ADDRESS || 'academy@waynautic.com';

    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    const whatsappLink = cleanPhone
      ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
          `Hi ${fullName}, thank you for reaching out to Waynautic Academy.`
        )}`
      : null;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 24px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(115deg, #1a3fb0 0%, #29abe2 100%); padding: 28px 32px; color: #ffffff; }
          .content { padding: 32px; }
          .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .field-value { font-size: 15px; color: #0f172a; font-weight: 600; margin-bottom: 20px; }
          .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1a3fb0; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 1.6; color: #334155; margin-top: 8px; white-space: pre-wrap; }
          .actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          .btn-reply { display: inline-block; background: #1a3fb0; color: #ffffff !important; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; }
          .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; }
          .footer { background: #0a1128; padding: 16px 32px; text-align: center; color: #94a3b8; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">New Inquiry from Waynautic Portal</h2>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">A visitor submitted the "Talk to Us" contact form</p>
          </div>
          <div class="content">
            <div class="field-label">Student Name</div>
            <div class="field-value">${fullName}</div>

            <div class="field-label">Email Address</div>
            <div class="field-value"><a href="mailto:${email}" style="color: #1a3fb0;">${email}</a></div>

            ${phone ? `
              <div class="field-label">Phone / WhatsApp</div>
              <div class="field-value"><a href="tel:${phone}" style="color: #1a3fb0;">${phone}</a></div>
            ` : ''}

            ${subject ? `
              <div class="field-label">Program of Interest / Subject</div>
              <div class="field-value">${subject}</div>
            ` : ''}

            <div class="field-label">Message</div>
            <div class="message-box">${message}</div>

            <div class="actions">
              <a href="mailto:${email}?subject=${encodeURIComponent(
                `Re: Your inquiry at Waynautic Academy`
              )}" class="btn-reply">Reply to ${fullName}</a>
              ${
                whatsappLink
                  ? `&nbsp;&nbsp;<a href="${whatsappLink}" class="btn-wa">Chat on WhatsApp</a>`
                  : ''
              }
            </div>
          </div>
          <div class="footer">
            Received on ${new Date().toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
            })} IST • Waynautic Academy Portal
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Try Microsoft Graph API first (official academy@waynautic.com)
    let dispatched = false;
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (tenantId && clientId && clientSecret) {
      try {
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
        if (tokenRes.ok && tokenData.access_token) {
          const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
            senderEmail
          )}/sendMail`;
          const payload = {
            message: {
              subject: emailSubject,
              body: { contentType: 'HTML', content: htmlContent },
              toRecipients: [
                { emailAddress: { address: targetEmail, name: 'Pramod Gogadare' } },
              ],
              ccRecipients: [
                { emailAddress: { address: 'contact@waynautic.com', name: 'Waynautic Contact' } },
              ],
              replyTo: [{ emailAddress: { address: email, name: fullName } }],
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
            dispatched = true;
            console.log(`[ContactEmail] Inquiry sent to ${targetEmail} via Microsoft Graph.`);
          }
        }
      } catch (graphErr) {
        console.error('[ContactEmail] Microsoft Graph dispatch failed, falling back to SMTP:', graphErr);
      }
    }

    // 2. Fallback to SMTP if Graph was not used or failed
    if (!dispatched) {
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = Number(process.env.SMTP_PORT || 465);
      const smtpSecure = process.env.SMTP_SECURE !== 'false';
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        const transportConfig = smtpHost.includes('gmail')
          ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpSecure,
              auth: { user: smtpUser, pass: smtpPass },
            };

        const transporter = nodemailer.createTransport(transportConfig as any);
        await transporter.sendMail({
          from: { name: `Waynautic Portal (${fullName})`, address: senderEmail },
          to: targetEmail,
          cc: 'contact@waynautic.com',
          replyTo: email,
          subject: emailSubject,
          html: htmlContent,
        });
        dispatched = true;
        console.log(`[ContactEmail] Inquiry sent to ${targetEmail} via SMTP.`);
      }
    }

    return NextResponse.json({
      success: true,
      deliveredTo: targetEmail,
      message: `Your inquiry has been sent to ${targetEmail}.`,
    });
  } catch (error: any) {
    console.error('[ContactEmail] Error processing inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send inquiry.' },
      { status: 500 }
    );
  }
}
