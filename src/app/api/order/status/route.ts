import { NextResponse } from 'next/server'
import { getPendingOrder, getStoredOrder } from '@/lib/order-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('orderId')?.trim()

  if (!orderId) {
    return NextResponse.json({ success: false, message: 'orderId is required.' }, { status: 400 })
  }

  const storedOrder = (await getStoredOrder(orderId)) || (await getPendingOrder(orderId))

  if (!storedOrder) {
    return NextResponse.json({ success: false, message: 'Order not found.', orderId }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    orderId: storedOrder.orderId,
    syncStatus: 'syncStatus' in storedOrder ? storedOrder.syncStatus : 'queued',
    syncWarnings: 'syncWarnings' in storedOrder ? storedOrder.syncWarnings : []
  })
}
