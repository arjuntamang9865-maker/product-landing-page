import nodemailer from 'nodemailer'
import { formatKathmanduDateTime, formatNpr, siteConfig } from '@/lib/site'
import type { OrderRecord } from '@/lib/validation'

type MailOptions = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createTransporter(port: number) {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER
  const smtpPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('Email credentials are not configured.')
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  })
}

async function sendWithFallbackTransport(options: MailOptions) {
  const sender = process.env.EMAIL_USER || process.env.SMTP_USER
  const from = process.env.EMAIL_FROM || `${process.env.BRAND_NAME || siteConfig.brandName} <${sender}>`
  const replyTo = options.replyTo || process.env.ORDER_EMAIL || process.env.BUSINESS_EMAIL || siteConfig.supportEmail
  const primaryPort = Number(process.env.SMTP_PORT || '587')
  const fallbackPort = primaryPort === 465 ? 587 : 465
  const smtpHost = process.env.SMTP_HOST || ''
  const gmailPreferredPorts = smtpHost.includes('gmail.com') ? [587, 465] : []
  const candidates = [...gmailPreferredPorts, primaryPort, fallbackPort].filter(
    (value, index, array) => array.indexOf(value) === index
  )

  let lastError: unknown

  for (const port of candidates) {
    try {
      const transporter = createTransporter(port)
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo
      })
      return
    } catch (error) {
      console.error(`Email error on SMTP port ${port}:`, error instanceof Error ? error.message : error)
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Email delivery failed.')
}

function makeEmailShell(content: string) {
  const brandName = process.env.BRAND_NAME || siteConfig.brandName
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4eadf;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#2b1d18;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;background:#fff8f1;border:1px solid #ead3be;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(95,53,42,0.10);">
            <tr>
              <td style="background:linear-gradient(135deg,#6a2f27 0%,#9c563f 52%,#c98a2a 100%);padding:28px 30px;color:#fff;">
                <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:.9;">${escapeHtml(brandName)}</div>
                <div style="font-size:28px;line-height:1.2;font-weight:700;margin-top:8px;">${escapeHtml(brandName)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px;">${content}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildBusinessOrderEmail(order: OrderRecord) {
  const content = `
    <div style="font-size:22px;font-weight:700;color:#5f352a;margin-bottom:8px;">New Order Received</div>
    <div style="font-size:14px;color:#6b5b52;margin-bottom:22px;">Please call the customer soon to confirm this order.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
      <tr>
        <td style="background:#fff1e4;border:1px solid #e7c8aa;border-radius:14px;padding:16px 18px;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8c4b38;margin-bottom:6px;">Order ID</div>
          <div style="font-size:20px;font-weight:700;color:#2b1d18;">${escapeHtml(order.orderId)}</div>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:8px;">
          <div style="background:#fff;border:1px solid #ead3be;border-radius:14px;padding:16px;">
            <div style="font-size:13px;font-weight:700;color:#8c4b38;margin-bottom:10px;">Customer Details</div>
            <div style="font-size:14px;line-height:1.8;color:#2b1d18;">
              <strong>Name:</strong> ${escapeHtml(order.fullName)}<br />
              <strong>Phone:</strong> ${escapeHtml(order.phoneNumber)}<br />
              <strong>Email:</strong> ${escapeHtml(order.emailAddress)}<br />
              <strong>Location:</strong> ${escapeHtml(order.exactLocation)}
            </div>
          </div>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:8px;">
          <div style="background:#fff;border:1px solid #ead3be;border-radius:14px;padding:16px;">
            <div style="font-size:13px;font-weight:700;color:#8c4b38;margin-bottom:10px;">Product Details</div>
            <div style="font-size:14px;line-height:1.8;color:#2b1d18;">
              <strong>Product:</strong> ${escapeHtml(order.productName)}<br />
              <strong>Quantity:</strong> ${order.quantity}<br />
              <strong>Price Per Piece:</strong> ${formatNpr(order.pricePerPiece)}<br />
              <strong>Total Price:</strong> ${formatNpr(order.totalPrice)}
            </div>
          </div>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
      <tr>
        <td style="background:#f9efe4;border:1px solid #e7c8aa;border-radius:14px;padding:16px;">
          <div style="font-size:13px;font-weight:700;color:#8c4b38;margin-bottom:10px;">Payment Details</div>
          <div style="font-size:14px;line-height:1.8;color:#2b1d18;">
            <strong>Payment Method:</strong> Cash On Delivery<br />
            <strong>Order Status:</strong> New Order<br />
            <strong>Date & Time:</strong> ${escapeHtml(order.dateTime)}
          </div>
        </td>
      </tr>
    </table>
    <div style="background:#fff7eb;border-left:4px solid #c98a2a;padding:14px 16px;border-radius:12px;color:#5f352a;font-size:14px;">
      Please call the customer soon to confirm this order.
    </div>
  `

  return {
    subject: `New Product Order Received - ${order.orderId}`,
    html: makeEmailShell(content)
  }
}

export function buildCustomerOrderEmail(order: OrderRecord) {
  const brandName = process.env.BRAND_NAME || siteConfig.brandName
  const content = `
    <div style="font-size:22px;font-weight:700;color:#5f352a;margin-bottom:10px;">Thank you for your order!</div>
    <div style="font-size:15px;line-height:1.75;color:#4b3e38;margin-bottom:18px;">
      Hi ${escapeHtml(order.fullName)},<br /><br />
      Thank you for your order. We have received your order successfully.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:18px;">
      <tr>
        <td style="background:#fff;border:1px solid #ead3be;border-radius:14px;padding:16px;">
          <div style="font-size:13px;font-weight:700;color:#8c4b38;margin-bottom:10px;">Order Summary</div>
          <div style="font-size:14px;line-height:1.8;color:#2b1d18;">
            <strong>Order ID:</strong> ${escapeHtml(order.orderId)}<br />
            <strong>Product:</strong> ${escapeHtml(order.productName)}<br />
            <strong>Quantity:</strong> ${order.quantity}<br />
            <strong>Total Price:</strong> ${formatNpr(order.totalPrice)}<br />
            <strong>Payment Method:</strong> Cash On Delivery
          </div>
        </td>
      </tr>
    </table>
    <div style="background:#f9efe4;border:1px solid #e7c8aa;border-radius:14px;padding:16px;font-size:14px;line-height:1.8;color:#5f352a;margin-bottom:18px;">
      Our sales representative will call you soon to confirm your order.
    </div>
    <div style="font-size:14px;line-height:1.8;color:#4b3e38;">
      Support: <a href="mailto:${escapeHtml(siteConfig.supportEmail)}" style="color:#8c4b38;text-decoration:none;">${escapeHtml(siteConfig.supportEmail)}</a><br />
      Thank you,<br />
      ${escapeHtml(brandName)}
    </div>
  `

  return {
    subject: `Your Order Has Been Received - ${brandName}`,
    html: makeEmailShell(content)
  }
}

export async function sendMail(options: MailOptions) {
  await sendWithFallbackTransport(options)
}

export function orderEmailPayload(order: OrderRecord) {
  return {
    business: buildBusinessOrderEmail(order),
    customer: buildCustomerOrderEmail(order)
  }
}

export function buildPreviewSummary(order: OrderRecord) {
  return `Order ${order.orderId} from ${order.fullName} at ${formatKathmanduDateTime()}`
}
