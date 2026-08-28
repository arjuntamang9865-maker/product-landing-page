import { CheckoutForm } from '@/components/checkout-form'
import { SectionHeading } from '@/components/section-heading'
import { formatNpr, siteConfig } from '@/lib/site'

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Checkout"
            title="Complete your order"
            description="Your product details are already filled in. Just add your contact details and exact location, then submit your Cash on Delivery order."
          />
          <div className="rounded-[32px] border border-[#ead3be] bg-white/90 p-6 shadow-glow">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard label="Product" value={siteConfig.productName} />
              <InfoCard label="Offer price" value={formatNpr(siteConfig.price)} />
              <InfoCard label="Original price" value={formatNpr(siteConfig.originalPrice)} />
              <InfoCard label="Delivery" value={`Free in Chitwan / ${formatNpr(siteConfig.deliveryFeeOutsideChitwan)} outside`} />
            </div>
            <div className="mt-6 rounded-3xl bg-[#f9efe4] p-5 text-sm leading-7 text-[#5f5048]">
              The total is calculated from your selected quantity and delivery area. Chitwan delivery is free.
            </div>
          </div>
        </div>

        <CheckoutForm />
      </div>
    </main>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ead3be] bg-[#fffaf4] p-4">
      <div className="text-sm text-[#8c4b38]">{label}</div>
      <div className="mt-1 font-semibold text-[#2b1d18]">{value}</div>
    </div>
  )
}
