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
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders" 
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

function buildEmailLayout({ title, subtitle, body, ctaLabel, ctaUrl }: {
  title: string;
  subtitle: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#F5A623,#E87461);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">${title}</h1>
          <p style="color:rgba(255,255,255,0.92);margin:0;font-size:14px;">${subtitle}</p>
        </div>
        <div style="padding:32px;">${body}
          ${ctaLabel && ctaUrl ? `
            <div style="margin-top:24px;">
              <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#E87461);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
                ${ctaLabel} →
              </a>
            </div>` : ''}
        </div>
        <div style="padding:16px 32px;background:#F5F4F0;text-align:center;">
          <p style="color:#A3A3A3;margin:0;font-size:12px;">&copy; ${new Date().getFullYear()} Sun Sales. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function orderShippedTemplate(customerName: string, orderNumber: string, trackingNumber?: string | null, trackingUrl?: string | null): string {
  const body = `
    <p style="color:#1A1A1A;margin:0 0 12px;font-size:16px;">Hi ${customerName},</p>
    <p style="color:#6B6B6B;margin:0 0 16px;font-size:14px;line-height:1.7;">Your order <strong>${orderNumber}</strong> is now on its way. We’ve packed everything carefully and handed it over for delivery.</p>
    ${trackingNumber ? `<p style="color:#1A1A1A;margin:0;font-size:14px;"><strong>Tracking number:</strong> ${trackingNumber}</p>` : ''}
  `;

  return buildEmailLayout({
    title: 'Your order has shipped 📦',
    subtitle: 'Track its progress and get ready to receive it.',
    body,
    ctaLabel: trackingUrl ? 'Track parcel' : 'View order',
    ctaUrl: trackingUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders`,
  });
}

export function orderDeliveredTemplate(customerName: string, orderNumber: string): string {
  return buildEmailLayout({
    title: 'Delivered successfully ✨',
    subtitle: `Order ${orderNumber} has arrived.`,
    body: `
      <p style="color:#1A1A1A;margin:0 0 12px;font-size:16px;">Hi ${customerName},</p>
      <p style="color:#6B6B6B;margin:0;font-size:14px;line-height:1.7;">We hope you love your Sun Sales order. If you have a moment, we'd love for you to leave a review and share your experience.</p>
    `,
    ctaLabel: 'Review your order',
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/orders`,
  });
}

export function designApprovedTemplate(customerName: string, designPreviewUrl?: string | null): string {
  return buildEmailLayout({
    title: 'Design approved ✅',
    subtitle: 'Your custom item is moving into production.',
    body: `
      <p style="color:#1A1A1A;margin:0 0 12px;font-size:16px;">Hi ${customerName},</p>
      <p style="color:#6B6B6B;margin:0 0 16px;font-size:14px;line-height:1.7;">Great news — your custom design has been approved and queued for production.</p>
      ${designPreviewUrl ? `<img src="${designPreviewUrl}" alt="Approved design preview" style="width:100%;max-width:320px;border-radius:12px;border:1px solid #E5E3DD;" />` : ''}
    `,
    ctaLabel: 'View your designs',
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/designs`,
  });
}

export function designRevisionTemplate(customerName: string, adminNotes?: string | null): string {
  return buildEmailLayout({
    title: 'A small design update is needed ✏️',
    subtitle: 'Please review the feedback and resubmit.',
    body: `
      <p style="color:#1A1A1A;margin:0 0 12px;font-size:16px;">Hi ${customerName},</p>
      <p style="color:#6B6B6B;margin:0 0 16px;font-size:14px;line-height:1.7;">Your design needs one small revision before it can move forward.</p>
      <div style="background:#F5F4F0;border-radius:12px;padding:16px;color:#1A1A1A;font-size:14px;">${adminNotes || 'Please adjust the design and resubmit it for approval.'}</div>
    `,
    ctaLabel: 'Update design',
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/designs`,
  });
}

export function designRejectedTemplate(customerName: string, reason?: string | null): string {
  return buildEmailLayout({
    title: 'About your custom design',
    subtitle: 'We could not approve the current submission.',
    body: `
      <p style="color:#1A1A1A;margin:0 0 12px;font-size:16px;">Hi ${customerName},</p>
      <p style="color:#6B6B6B;margin:0 0 16px;font-size:14px;line-height:1.7;">Unfortunately, we couldn't approve this version of your design.</p>
      <div style="background:#FDF2F2;border-radius:12px;padding:16px;color:#1A1A1A;font-size:14px;">${reason || 'Please contact support for help creating an approved version.'}</div>
    `,
    ctaLabel: 'Contact support',
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contact`,
  });
}

export function adminNewOrderTemplate(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  paymentMethod: string;
  items: { name: string; quantity: number; price: string }[];
}): string {
  const itemsHtml = order.items
    .map((item) => `<li style="margin:0 0 8px;">${item.name} × ${item.quantity} — ${item.price}</li>`)
    .join('');

  return buildEmailLayout({
    title: 'New order received ☀️',
    subtitle: `Order ${order.orderNumber} is ready for review.`,
    body: `
      <p style="color:#1A1A1A;margin:0 0 10px;font-size:15px;"><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
      <p style="color:#1A1A1A;margin:0 0 10px;font-size:15px;"><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p style="color:#1A1A1A;margin:0 0 16px;font-size:15px;"><strong>Total:</strong> ${order.total}</p>
      <ul style="margin:0;padding-left:20px;color:#6B6B6B;font-size:14px;line-height:1.7;">${itemsHtml}</ul>
    `,
    ctaLabel: 'Open admin orders',
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders`,
  });
}
