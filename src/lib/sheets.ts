import { google } from 'googleapis'
import type { OrderRecord } from '@/lib/validation'

const SHEET_HEADERS = [
  'Order ID',
  'Date/Time',
  'Customer Name',
  'Phone',
  'Email',
  'Address',
  'Product',
  'Quantity',
  'Unit Price',
  'Total Price',
  'Payment Method',
  'Order Status',
  'Notes'
]

function getPrivateKey() {
  const raw = process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY_JSON
  if (!raw) return undefined

  const trimmed = raw.trim().replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1')
  return trimmed.replace(/\\n/g, '\n')
}

function getServiceAccountCredentials() {
  const rawJson =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_CREDENTIALS_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  if (!rawJson) {
    return {
      email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: getPrivateKey()
    }
  }

  try {
    const parsed = JSON.parse(rawJson.trim().replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1'))
    const email = typeof parsed.client_email === 'string' ? parsed.client_email : undefined
    const privateKey = typeof parsed.private_key === 'string' ? parsed.private_key.replace(/\\n/g, '\n') : undefined

    return {
      email: email || process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: privateKey || getPrivateKey()
    }
  } catch {
    return {
      email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: getPrivateKey()
    }
  }
}

function normalizeSheetName(name: string) {
  const escaped = name.replace(/'/g, "''")
  return `'${escaped}'`
}

function buildSheetRanges(tabName: string) {
  const candidates = Array.from(
    new Set(
      [
        tabName,
        tabName.trim(),
        tabName.trim().replace(/\s+/g, ' '),
        'Sheet 1',
        'sheet 1',
        'Sheet1'
      ].filter(Boolean)
    )
  )

  return candidates.map((candidate) => `${normalizeSheetName(candidate)}!A:M`)
}

function buildSheetNameCandidates(tabName: string) {
  return Array.from(
    new Set(
      [
        tabName,
        tabName.trim(),
        tabName.trim().replace(/\s+/g, ' '),
        'Sheet 1',
        'sheet 1',
        'Sheet1'
      ].filter(Boolean)
    )
  )
}

async function ensurePremiumSheetLayout(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string
) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId
  })

  const candidateTitles = buildSheetNameCandidates(tabName)
  const actualTabName =
    meta.data.sheets?.find((item) => candidateTitles.includes(item.properties?.title || ''))?.properties?.title ||
    tabName

  const readRange = `${normalizeSheetName(actualTabName)}!A1:M1`
  const headerRead = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: readRange
  })

  const row = headerRead.data.values?.[0] || []
  const isBlank = row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '')
  const isHeaderRow = row.length > 0 && row.slice(0, SHEET_HEADERS.length).every((cell, index) => String(cell ?? '').trim() === SHEET_HEADERS[index])

  if (!isBlank && isHeaderRow) {
    return
  }

  if (isBlank) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: readRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [SHEET_HEADERS] }
    })
  }

  const sheet = meta.data.sheets?.find((item) => item.properties?.title === actualTabName)
  const sheetId = sheet?.properties?.sheetId
  if (typeof sheetId !== 'number') {
    return
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        },
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.55,
                  green: 0.29,
                  blue: 0.22
                },
                textFormat: {
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1
                  },
                  bold: true,
                  fontSize: 12
                },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
          }
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: SHEET_HEADERS.length
            }
          }
        }
      ]
    }
  })
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3, delayMs = 750): Promise<T> {
  let lastError: unknown

  for (let index = 0; index < attempts; index += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (index < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (index + 1)))
      }
    }
  }

  throw lastError
}

export async function appendOrderToSheet(order: OrderRecord) {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const { email: serviceAccountEmail, privateKey } = getServiceAccountCredentials()
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || 'Sheet 1'

  if (!sheetId || !serviceAccountEmail || !privateKey) {
    throw new Error('Google Sheets credentials are not configured.')
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('GOOGLE_PRIVATE_KEY is not formatted as a valid PEM private key.')
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const sheets = google.sheets({ version: 'v4', auth })
  await ensurePremiumSheetLayout(sheets, sheetId, tabName)
  const values = [
    [
      order.orderId,
      order.dateTime,
      order.fullName,
      order.phoneNumber,
      order.emailAddress,
      order.exactLocation,
      order.productName,
      order.quantity,
      order.pricePerPiece,
      order.totalPrice,
      order.paymentMethod,
      order.orderStatus,
      order.notes
    ]
  ]

  let lastError: unknown
  for (const range of buildSheetRanges(tabName)) {
    try {
      await withRetry(
        () =>
          sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
          }),
        3
      )
      return
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to append order to Google Sheets.')
}
