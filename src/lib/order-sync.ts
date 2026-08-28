import { appendOrderToSheet } from '@/lib/sheets'
import { orderEmailPayload, sendMail } from '@/lib/email'
import type { OrderRecord } from '@/lib/validation'
import { siteConfig } from '@/lib/site'

export type SyncResult = {
  spreadsheetSaved: boolean
  businessEmailSent: boolean
  customerEmailSent: boolean
  warnings: string[]
  stage: 'complete' | 'google_sheets' | 'email'
}

export async function syncOrderArtifacts(order: OrderRecord): Promise<SyncResult> {
  const warnings: string[] = []

  const { business, customer } = orderEmailPayload(order)
  const businessEmail = process.env.BUSINESS_EMAIL || siteConfig.supportEmail

  const [sheet, businessMail, customerMail] = await Promise.allSettled([
    appendOrderToSheet(order),
    sendMail({
      to: businessEmail,
      subject: business.subject,
      html: business.html,
      replyTo: process.env.EMAIL_FROM || siteConfig.replyToEmail
    }),
    sendMail({
      to: order.emailAddress,
      subject: customer.subject,
      html: customer.html,
      replyTo: process.env.EMAIL_FROM || siteConfig.replyToEmail
    })
  ])

  const spreadsheetSaved = sheet.status === 'fulfilled'
  const businessEmailSent = businessMail.status === 'fulfilled'
  const customerEmailSent = customerMail.status === 'fulfilled'

  if (!spreadsheetSaved) {
    console.error('Google Sheets error:', sheet.reason instanceof Error ? sheet.reason.message : sheet.reason)
    warnings.push(sheet.reason instanceof Error ? sheet.reason.message : 'Google Sheets sync failed.')
  }

  if (!businessEmailSent) {
    console.error(
      'Business email error:',
      businessMail.reason instanceof Error ? businessMail.reason.message : businessMail.reason
    )
    warnings.push(
      businessMail.reason instanceof Error ? businessMail.reason.message : 'Business email notification failed.'
    )
  }

  if (!customerEmailSent) {
    console.error(
      'Customer email error:',
      customerMail.reason instanceof Error ? customerMail.reason.message : customerMail.reason
    )
    warnings.push(
      customerMail.reason instanceof Error ? customerMail.reason.message : 'Customer email notification failed.'
    )
  }

  return {
    spreadsheetSaved,
    businessEmailSent,
    customerEmailSent,
    warnings,
    stage: !spreadsheetSaved ? 'google_sheets' : !businessEmailSent || !customerEmailSent ? 'email' : 'complete'
  }
}
