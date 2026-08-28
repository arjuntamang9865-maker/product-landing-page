'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createOrderId, formatNpr, getDeliveryFee, siteConfig } from '@/lib/site'

type FormState = {
  fullName: string
  phoneNumber: string
  emailAddress: string
  exactLocation: string
}

export function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuantity = Number(searchParams.get('quantity') || '1') || 1
  const initialProduct = searchParams.get('product') || siteConfig.productName
  const initialPrice = Number(searchParams.get('price') || String(siteConfig.price)) || siteConfig.price

  const [form, setForm] = useState<FormState>({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    exactLocation: ''
  })
  const [quantity, setQuantity] = useState(initialQuantity)
  const [productName] = useState(initialProduct)
  const [pricePerPiece] = useState(initialPrice)
  const [orderId] = useState(() => createOrderId())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuantity(initialQuantity)
  }, [initialQuantity])

  const deliveryFee = useMemo(
    () => (form.exactLocation.trim() ? getDeliveryFee(form.exactLocation) : 0),
    [form.exactLocation]
  )
  const subtotal = useMemo(() => pricePerPiece * quantity, [pricePerPiece, quantity])
  const totalPrice = subtotal + deliveryFee

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')

    if (!form.fullName || !form.phoneNumber || !form.emailAddress || !form.exactLocation) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          productName,
          quantity,
          pricePerPiece,
          totalPrice,
          orderId
        })
      })

      const data = (await response.json()) as {
        success?: boolean
        accepted?: boolean
        message?: string
        error?: string
        stage?: string
        orderId?: string
        syncStatus?: string
      }

      if (!data.orderId) {
        throw new Error(data.message || 'Order submission failed.')
      }

      const params = new URLSearchParams({
        orderId: data.orderId,
        product: productName,
        quantity: String(quantity),
        total: String(totalPrice),
        paymentMethod: 'Cash On Delivery',
        status: data.success ? 'success' : 'error'
      })

      if (!data.success) {
        params.set('stage', data.stage || 'email')
        params.set('error', data.error || data.message || 'Order processing failed.')
      }

      router.push(`/thank-you?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while submitting the order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submitOrder} className="rounded-[32px] border border-[#ead3be] bg-white/95 p-6 shadow-glow sm:p-8">
      <div className="grid gap-5">
        <Field label="Full Name" value={form.fullName} onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))} placeholder="Enter your full name" />
        <Field label="Phone Number" value={form.phoneNumber} onChange={(value) => setForm((prev) => ({ ...prev, phoneNumber: value }))} placeholder="98XXXXXXXX" />
        <Field label="Email Address" value={form.emailAddress} onChange={(value) => setForm((prev) => ({ ...prev, emailAddress: value }))} placeholder="you@example.com" type="email" />
        <Field
          label="Exact Location"
          value={form.exactLocation}
          onChange={(value) => setForm((prev) => ({ ...prev, exactLocation: value }))}
          placeholder="Kindly share your exact location"
          as="textarea"
        />
      </div>

      <div className="mt-8 grid gap-4 rounded-[28px] bg-[#f9efe4] p-5 sm:grid-cols-2">
        <ReadOnlyField label="Product Name" value={productName} />
        <div className="rounded-2xl border border-[#ead3be] bg-white p-4">
          <div className="text-sm text-[#6f5c53]">Quantity</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-10 w-10 rounded-full border border-[#e5cdb5] text-lg text-[#8c4b38]"
            >
              −
            </button>
            <div className="text-2xl font-semibold text-[#2b1d18]">{quantity}</div>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-10 w-10 rounded-full border border-[#e5cdb5] text-lg text-[#8c4b38]"
            >
              +
            </button>
          </div>
        </div>
        <ReadOnlyField label="Price Per Piece" value={formatNpr(pricePerPiece)} />
        <ReadOnlyField label="Total Price" value={formatNpr(totalPrice)} />
        <div className="rounded-2xl border border-[#ead3be] bg-white p-4 sm:col-span-2">
          <div className="text-sm font-semibold text-[#8c4b38]">Delivery Fee</div>
          <div className="mt-1 text-base text-[#2b1d18]">
            {form.exactLocation.trim() && form.exactLocation.toLowerCase().includes('chitwan')
              ? 'Free inside Chitwan'
              : form.exactLocation.trim()
                ? `Outside Chitwan: ${formatNpr(deliveryFee)}`
                : 'Enter your exact location to confirm the delivery fee'}
          </div>
        </div>
      </div>

      {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-[#8c4b38] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#6f382d] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Submitting Order...' : 'Order Now'}
      </button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  as = 'input'
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  as?: 'input' | 'textarea'
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#2b1d18]">{label}</span>
      {as === 'textarea' ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-2xl border border-[#e5cdb5] bg-white px-4 py-3 text-[#2b1d18] outline-none transition placeholder:text-[#9c8d82] focus:border-[#8c4b38] focus:ring-2 focus:ring-[#8c4b38]/15"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          className="w-full rounded-2xl border border-[#e5cdb5] bg-white px-4 py-3 text-[#2b1d18] outline-none transition placeholder:text-[#9c8d82] focus:border-[#8c4b38] focus:ring-2 focus:ring-[#8c4b38]/15"
        />
      )}
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ead3be] bg-white p-4">
      <div className="text-sm text-[#6f5c53]">{label}</div>
      <div className="mt-1 text-base font-semibold text-[#2b1d18]">{value}</div>
    </div>
  )
}
