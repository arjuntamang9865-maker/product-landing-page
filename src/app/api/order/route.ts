import { NextResponse } from 'next/server'
import { createOrderId, formatKathmanduDateTime } from '@/lib/site'
import { parseOrderPayload } from '@/lib/validation'
import {
  appendStoredOrder,
  getStoredOrder,
  getPendingOrder,
  queuePendingOrder,
  removePendingOrder
} from '@/lib/order-store'
import { syncOrderArtifacts } from '@/lib/order-sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const allowedOrigin = process.env.FRONTEND_URL
  if (origin && allowedOrigin && !isAllowedOrigin(origin, allowedOrigin)) {
    return NextResponse.json({ success: false, message: 'Origin not allowed.' }, { status: 403 })
  }

  let body: unknown
  let parsed
  try {
    body = await request.json()
    parsed = parseOrderPayload(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Invalid order data.' },
      { status: 400 }
    )
  }

  const requestedOrderId = getRequestedOrderId(body)
  const orderId = requestedOrderId || createOrderId()
  const existingOrder = (await getStoredOrder(orderId)) || (await getPendingOrder(orderId))

  if (existingOrder) {
    const existingSyncStatus = 'syncStatus' in existingOrder ? existingOrder.syncStatus : 'queued'
    return NextResponse.json(
      {
        success: existingSyncStatus === 'synced',
        accepted: true,
        duplicate: true,
        orderId: existingOrder.orderId,
        stage:
          existingSyncStatus === 'synced'
            ? 'complete'
            : existingSyncStatus === 'failed'
              ? 'order_processing'
              : 'processing',
        syncStatus: existingSyncStatus,
        syncWarnings: existingOrder.syncWarnings,
        message:
          existingSyncStatus === 'synced'
            ? 'Order already processed.'
            : 'Order already received and is still being processed.'
      },
      { status: existingSyncStatus === 'synced' ? 200 : 202 }
    )
  }

  const order = {
    ...parsed,
    orderId,
    dateTime: formatKathmanduDateTime(),
    paymentMethod: 'Cash On Delivery' as const,
    orderStatus: 'New Order' as const,
    notes: '',
    deliveryFee: parsed.totalPrice - parsed.quantity * parsed.pricePerPiece
  }

  await appendStoredOrder({
    ...order,
    syncStatus: 'processing',
    syncWarnings: []
  })

  const syncWarnings: string[] = []

  try {
    const syncResult = await syncOrderArtifacts(order)
    syncWarnings.push(...syncResult.warnings)

    await appendStoredOrder({
      ...order,
      syncStatus: syncWarnings.length === 0 ? 'synced' : 'queued',
      syncWarnings: [...syncWarnings]
    })

    if (syncWarnings.length > 0) {
      await queuePendingOrder(order, syncWarnings)
      console.error('Order sync warning:', {
        orderId,
        stage: syncResult.stage,
        warnings: syncWarnings
      })
      return NextResponse.json(
        {
          success: false,
          accepted: true,
          orderId,
          stage: syncResult.stage,
          syncStatus: 'queued',
          message: 'Order received, but some integrations failed.',
          error: syncWarnings[0],
          syncWarnings
        },
        { status: 502 }
      )
    }

    await removePendingOrder(orderId)

    return NextResponse.json({
      success: true,
      accepted: true,
      orderId,
      stage: 'complete',
      message:
        'Order submitted successfully.',
      syncWarnings,
      syncStatus: syncWarnings.length === 0 ? 'synced' : 'queued'
    })
  } catch (error) {
    console.error('Order processing error:', error instanceof Error ? error.message : error)
    await appendStoredOrder({
      ...order,
      syncStatus: 'failed',
      syncWarnings: [error instanceof Error ? error.message : 'Unexpected order processing error.']
    })
    await queuePendingOrder(order, [error instanceof Error ? error.message : 'Unexpected order processing error.'])
    return NextResponse.json(
      {
        success: false,
        accepted: true,
        message: 'Order received, but processing failed.',
        stage: 'order_processing',
        error: error instanceof Error ? error.message : 'Unexpected order processing error.',
        syncWarnings: [error instanceof Error ? error.message : 'Unexpected order processing error.'],
        syncStatus: 'failed',
        orderId
      },
      { status: 500 }
    )
  }
}

function getRequestedOrderId(body: unknown) {
  if (!body || typeof body !== 'object') return undefined
  const value = (body as Record<string, unknown>).orderId
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function isAllowedOrigin(requestOrigin: string, configuredOrigin: string) {
  if (requestOrigin === configuredOrigin) return true

  try {
    const requestUrl = new URL(requestOrigin)
    const allowedUrl = new URL(configuredOrigin)

    const isLocalHost =
      ['localhost', '127.0.0.1', '::1'].includes(requestUrl.hostname) &&
      ['localhost', '127.0.0.1', '::1'].includes(allowedUrl.hostname)

    return isLocalHost || (requestUrl.hostname === allowedUrl.hostname && requestUrl.protocol === allowedUrl.protocol)
  } catch {
    return false
  }
}
