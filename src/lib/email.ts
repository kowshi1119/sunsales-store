import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@sunsales.lk';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Send an email using Resend (or log in dev if no API key) */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    if (!resend) {
      // Development fallback: log email to console
      console.log('\n📧 EMAIL (dev mode - no RESEND_API_KEY):');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Body: ${text || '(HTML email)'}\n`);
      return true;
    }

    const { error } = await resend.emails.send({
      from: `Sun Sales <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/** OTP verification email template */
export function otpEmailTemplate(code: string, type: 'verification' | 'password_reset'): string {
  const title = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
  const message =
    type === 'verification'
      ? 'Use this code to verify your Sun Sales account:'
      : 'Use this code to reset your password:';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#F5A623,#E87461);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">☀️ Sun Sales</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A1A;margin:0 0 8px;font-size:20px;">${title}</h2>
          <p style="color:#6B6B6B;margin:0 0 24px;font-size:15px;">${message}</p>
          <div style="background:#F5F4F0;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#1A1A1A;">${code}</span>
          </div>
          <p style="color:#A3A3A3;margin:0;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="padding:16px 32px;background:#F5F4F0;text-align:center;">
          <p style="color:#A3A3A3;margin:0;font-size:12px;">&copy; ${new Date().getFullYear()} Sun Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/** Welcome email template */
export function welcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#F5A623,#E87461);padding:40px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0 0 8px;font-size:28px;">Welcome to Sun Sales! ☀️</h1>
          <p style="color:rgba(255,255,255,0.9);margin:0;font-size:15px;">Your account has been verified</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#1A1A1A;margin:0 0 16px;font-size:16px;">Hi ${name},</p>
          <p style="color:#6B6B6B;margin:0 0 24px;font-size:15px;line-height:1.6;">
            Thank you for joining Sun Sales! We're excited to have you. Explore our collection of premium gifts, 
            custom phone covers, and personalized photo frames.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" 
             style="display:inline-block;background:linear-gradient(135deg,#F5A623,#E87461);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
            Start Shopping →
          </a>
        </div>
        <div style="padding:16px 32px;background:#F5F4F0;text-align:center;">
          <p style="color:#A3A3A3;margin:0;font-size:12px;">&copy; ${new Date().getFullYear()} Sun Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/** Order confirmation email template */
export function orderConfirmationTemplate(order: {
  orderNumber: string;
  customerName: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#1A1A1A;font-size:14px;border-bottom:1px solid #E5E3DD;">
          ${item.name} × ${item.quantity}
        </td>
        <td style="padding:8px 0;color:#1A1A1A;font-size:14px;text-align:right;border-bottom:1px solid #E5E3DD;">
          ${item.price}
        </td>
      </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#F5A623,#E87461);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Order Confirmed! 🎉</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#1A1A1A;margin:0 0 8px;font-size:16px;">Hi ${order.customerName},</p>
          <p style="color:#6B6B6B;margin:0 0 24px;font-size:14px;">Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
            ${itemsHtml}
            <tr>
              <td style="padding:12px 0;font-weight:700;font-size:16px;color:#1A1A1A;">Total</td>
              <td style="padding:12px 0;font-weight:700;font-size:16px;color:#1A1A1A;text-align:right;">${order.total}</td>
            </tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders" 
             style="display:inline-block;background:linear-gradient(135deg,#F5A623,#E87461);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
            Track Your Order →
          </a>
        </div>
        <div style="padding:16px 32px;background:#F5F4F0;text-align:center;">
          <p style="color:#A3A3A3;margin:0;font-size:12px;">&copy; ${new Date().getFullYear()} Sun Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
