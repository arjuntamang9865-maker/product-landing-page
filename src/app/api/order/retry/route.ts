import { NextResponse } from 'next/server'
import {
  getPendingOrders,
  getPendingOrder,
  replacePendingOrders,
  updateStoredOrderStatus,
  removePendingOrder
} from '@/lib/order-store'
import { syncOrderArtifacts } from '@/lib/order-sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderId?: string }
  const requestedOrderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
  const singlePendingOrder = requestedOrderId ? await getPendingOrder(requestedOrderId) : undefined
  const pendingOrders = requestedOrderId ? (singlePendingOrder ? [singlePendingOrder] : []) : await getPendingOrders()
  const remaining: typeof pendingOrders = []
  const results: Array<{ orderId: string; synced: boolean; warnings: string[] }> = []

  for (const order of pendingOrders) {
    const syncResult = await syncOrderArtifacts(order)
    const synced = syncResult.warnings.length === 0

    results.push({
      orderId: order.orderId,
      synced,
      warnings: syncResult.warnings
    })

    if (synced) {
      await updateStoredOrderStatus(order.orderId, 'synced', [])
      await removePendingOrder(order.orderId)
    } else {
      remaining.push({
        ...order,
        syncWarnings: syncResult.warnings
      })
      await updateStoredOrderStatus(order.orderId, 'queued', syncResult.warnings)
    }
  }

  if (!requestedOrderId) {
    await replacePendingOrders(remaining)
  }

  return NextResponse.json({
    success: true,
    retried: results.length,
    remaining: remaining.length,
    results
  })
}
