const DEFAULT_FROM = 'GrooveCart <orders@groovecart.test>'
const DEFAULT_RESEND_API_BASE = 'https://api.resend.com'

interface OrderEmailLineItem {
  title: string
  artist: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export interface OrderConfirmationEmail {
  orderReference: string
  sessionId: string
  customerEmail: string | null
  totalCents: number
  lineItems: OrderEmailLineItem[]
}

export interface EmailSendResult {
  ok: boolean
  error?: string
}

function resendApiBase(): string {
  return (
    process.env.RESEND_API_BASE ||
    process.env.RESEND_EMULATOR_URL ||
    DEFAULT_RESEND_API_BASE
  ).replace(/\/$/, '')
}

function isLocalResend(baseUrl: string): boolean {
  try {
    const hostname = new URL(baseUrl).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
  } catch {
    return false
  }
}

function money(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildOrderEmail(order: OrderConfirmationEmail): { subject: string; html: string; text: string } {
  const subject = `GrooveCart order ${order.orderReference} confirmed`
  const lines = order.lineItems.map(
    (item) =>
      `${item.quantity} x ${item.title} - ${item.artist} (${money(item.unitPriceCents)} each): ${money(item.lineTotalCents)}`,
  )
  const text = [
    `Thanks for your GrooveCart order.`,
    '',
    `Order reference: ${order.orderReference}`,
    `Session: ${order.sessionId}`,
    '',
    'Items:',
    ...lines.map((line) => `- ${line}`),
    '',
    `Total: ${money(order.totalCents)}`,
  ].join('\n')

  const htmlItems = order.lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <strong>${escapeHtml(item.title)}</strong><br />
            <span style="color:#6b7280;">${escapeHtml(item.artist)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${money(item.lineTotalCents)}</td>
        </tr>`,
    )
    .join('')

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
      <h1 style="font-size:22px;margin:0 0 12px;">Your GrooveCart order is confirmed</h1>
      <p style="margin:0 0 18px;color:#4b5563;">Thanks for shopping with GrooveCart. We received your vinyl order.</p>
      <p style="margin:0 0 18px;"><strong>Order reference:</strong> ${escapeHtml(order.orderReference)}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:0 0 8px;border-bottom:1px solid #111827;">Record</th>
            <th style="text-align:center;padding:0 0 8px;border-bottom:1px solid #111827;">Qty</th>
            <th style="text-align:right;padding:0 0 8px;border-bottom:1px solid #111827;">Total</th>
          </tr>
        </thead>
        <tbody>${htmlItems}</tbody>
      </table>
      <p style="font-size:18px;margin:0;"><strong>Total:</strong> ${money(order.totalCents)}</p>
    </div>`

  return { subject, html, text }
}

export async function sendOrderConfirmationEmail(order: OrderConfirmationEmail): Promise<EmailSendResult> {
  if (!order.customerEmail || !order.customerEmail.includes('@')) {
    return { ok: false, error: 'No customer email was recorded for this order.' }
  }

  const baseUrl = resendApiBase()
  const apiKey = process.env.RESEND_API_KEY || (isLocalResend(baseUrl) ? 're_test_emulated' : '')
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not configured.' }
  }

  const email = buildOrderEmail(order)
  try {
    const res = await fetch(`${baseUrl}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: order.customerEmail,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return {
        ok: false,
        error: `Resend returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`,
      }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
