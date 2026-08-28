import Link from 'next/link'
import { formatNpr } from '@/lib/site'
import { OrderSyncStatus } from '@/components/order-sync-status'

type ThankYouSearchParams = {
  orderId?: string
  product?: string
  quantity?: string
  total?: string
  paymentMethod?: string
  status?: 'success' | 'error' | 'processing'
  stage?: string
  error?: string
}

export default async function ThankYouPage({
  searchParams
}: {
  searchParams: Promise<ThankYouSearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const orderId = resolvedSearchParams.orderId || 'BFP-ORDER'
  const product = resolvedSearchParams.product || 'Bobin Foto Product'
  const quantity = Number(resolvedSearchParams.quantity || '1') || 1
  const total = Number(resolvedSearchParams.total || '0') || 0
  const paymentMethod = resolvedSearchParams.paymentMethod || 'Cash On Delivery'
  const status = resolvedSearchParams.status || 'processing'
  const stage = resolvedSearchParams.stage
  const error = resolvedSearchParams.error
  const initialStatus = status === 'success' ? 'success' : status === 'error' ? 'error' : 'processing'

  return (
    <main className="mx-auto flex min-h-[calc(100vh-180px)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-[36px] border border-[#ead3be] bg-white/95 p-8 text-center shadow-glow sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9efe4] text-3xl text-[#8c4b38]">
          ✓
        </div>
        <h1 className="font-display text-4xl text-[#2b1d18] sm:text-5xl">Thank you for your order!</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f5048]">
          Our sales representative will call you soon to confirm your order.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <Summary label="Order ID" value={orderId} />
          <Summary label="Product ordered" value={product} />
          <Summary label="Quantity" value={String(quantity)} />
          <Summary label="Total price" value={total ? formatNpr(total) : 'Pending'} />
          <Summary label="Payment method" value={paymentMethod} />
        </div>

        <OrderSyncStatus
          orderId={orderId}
          initialStatus={initialStatus}
          initialMessage={
            initialStatus === 'success'
              ? 'Order received successfully.'
              : initialStatus === 'error'
                ? 'We received a problem while processing your order.'
                : 'Sending your order to Google Sheets and email...'
          }
          initialError={error || undefined}
          initialStage={stage}
        />

        <div className="mt-8">
          <Link href="/" className="inline-flex rounded-full bg-[#8c4b38] px-6 py-3.5 font-semibold text-white transition hover:bg-[#6f382d]">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ead3be] bg-[#fffaf4] p-4">
      <div className="text-sm text-[#8c4b38]">{label}</div>
      <div className="mt-1 font-semibold text-[#2b1d18]">{value}</div>
    </div>
  )
}
