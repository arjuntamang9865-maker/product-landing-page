'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatNpr, getDeliveryFee, siteConfig } from '@/lib/site'

export function LandingConfigurator() {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  const subtotal = useMemo(() => siteConfig.price * quantity, [quantity])
  const estimatedDelivery = 0
  const total = subtotal + estimatedDelivery

  function goToCheckout() {
    const params = new URLSearchParams({
      product: siteConfig.productName,
      quantity: String(quantity),
      price: String(siteConfig.price),
      subtotal: String(subtotal),
      total: String(total)
    })
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="rounded-[32px] border border-[#ead3be] bg-white/90 p-6 shadow-glow">
      <div className="text-sm uppercase tracking-[0.24em] text-[#8c4b38]">Order Summary</div>
      <div className="mt-2 text-2xl font-semibold text-[#2b1d18]">{formatNpr(siteConfig.price)} per piece</div>
      <div className="mt-4 rounded-2xl bg-[#f9efe4] p-4 text-sm leading-7 text-[#5f5048]">
        Free inside Chitwan. Outside Chitwan delivery fee is {formatNpr(getDeliveryFee('outside'))}.
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#ead3be] px-4 py-3">
        <div>
          <div className="text-sm text-[#6f5c53]">Quantity</div>
          <div className="text-lg font-semibold text-[#2b1d18]">{quantity}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="h-11 w-11 rounded-full border border-[#e5cdb5] text-xl text-[#8c4b38] transition hover:bg-[#fbf3e9]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            className="h-11 w-11 rounded-full border border-[#e5cdb5] text-xl text-[#8c4b38] transition hover:bg-[#fbf3e9]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#f9efe4] p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8c4b38]">Subtotal</div>
          <div className="mt-1 text-lg font-semibold text-[#2b1d18]">{formatNpr(subtotal)}</div>
        </div>
        <div className="rounded-2xl bg-[#f9efe4] p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#8c4b38]">Estimated total</div>
          <div className="mt-1 text-lg font-semibold text-[#2b1d18]">{formatNpr(total)}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={goToCheckout}
          className="rounded-full bg-[#8c4b38] px-6 py-3.5 font-semibold text-white transition hover:bg-[#6f382d]"
        >
          Purchase Now
        </button>
        <button
          type="button"
          onClick={goToCheckout}
          className="rounded-full border border-[#8c4b38] px-6 py-3.5 font-semibold text-[#8c4b38] transition hover:bg-[#fff7f0]"
        >
          Order Now
        </button>
      </div>
    </div>
  )
}
