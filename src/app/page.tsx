import Image from 'next/image'
import Link from 'next/link'
import { FaqAccordion } from '@/components/faq-accordion'
import { FlodeskEmbed } from '@/components/flodesk-embed'
import { LandingConfigurator } from '@/components/landing-configurator'
import { ProductGallery } from '@/components/product-gallery'
import { SectionHeading } from '@/components/section-heading'
import { TestimonialGrid } from '@/components/testimonial-grid'
import { formatNpr, siteConfig } from '@/lib/site'

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-warm-gradient opacity-70" />
      <div className="absolute left-1/2 top-[-8rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#c98a2a]/20 blur-3xl" />

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <div>
              <h1 className="font-display text-5xl leading-tight text-[#2b1d18] sm:text-6xl">
                Preserve Your Beautiful Memories
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f5048]">
                Turn your favorite photos into beautiful {siteConfig.productName} that you can keep, display, or gift to someone special.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-[#5f5048] sm:grid-cols-2">
              <TrustChip text="High-quality photo printing" />
              <TrustChip text="Beautiful and memorable designs" />
              <TrustChip text="Perfect for gifts and special occasions" />
              <TrustChip text="Made to preserve your precious memories" />
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#5f5048]">
              Your memories deserve more than just staying on your phone. Make them something you can see and cherish every day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="rounded-full bg-[#8c4b38] px-6 py-3.5 text-center font-semibold text-white shadow-glow transition hover:bg-[#6f382d]">
                Purchase Now
              </Link>
              <Link href="/checkout" className="rounded-full border border-[#8c4b38] bg-white/70 px-6 py-3.5 text-center font-semibold text-[#8c4b38] transition hover:bg-[#fff7f0]">
                Order Now
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[#6f5c53]">
              <span className="rounded-full border border-[#ead3be] bg-white/80 px-4 py-2">Fast delivery</span>
              <span className="rounded-full border border-[#ead3be] bg-white/80 px-4 py-2">Customer support</span>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="overflow-hidden rounded-[34px] border border-[#ead3be] bg-white/80 p-4 shadow-glow">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#f5ebdf]">
                <Image src={siteConfig.heroImage} alt={siteConfig.productName} fill priority className="object-cover" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniStat label="Offer price" value={formatNpr(siteConfig.price)} />
              <MiniStat label="Original price" value={formatNpr(siteConfig.originalPrice)} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Product Showcase"
              title="See the product from every angle"
              description="Swipe through the framed product images on the left and use the summary on the right to choose your quantity and place your order quickly."
            />
            <div className="mt-8">
              <ProductGallery images={[...siteConfig.galleryImages]} />
            </div>
          </div>
          <div className="lg:pt-12">
            <LandingConfigurator />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[34px] border border-[#ead3be] bg-[#fffaf4]/90 p-8 shadow-glow">
          <SectionHeading
            eyebrow="Why Buy This Product"
            title="A meaningful gift that feels premium and personal"
            description="Every Bobin Foto Product is built to turn a memory into something that lives beautifully in your home."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {siteConfig.benefits.map((benefit) => (
              <div key={benefit} className="rounded-3xl border border-[#ead3be] bg-white p-5 text-sm leading-7 text-[#5f5048] shadow-sm">
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/checkout" className="inline-flex rounded-full bg-[#8c4b38] px-6 py-3.5 font-semibold text-white transition hover:bg-[#6f382d]">
              Buy Now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow="Testimonials"
          title="What customers are saying"
          description="Trust building stories from customers who turned their memories into a lasting display piece."
        />
        <div className="mt-8">
          <TestimonialGrid testimonials={[...siteConfig.testimonials]} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Quick answers to the most common questions before you order."
        />
        <div className="mt-8">
          <FaqAccordion items={[...siteConfig.faqs]} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[38px] border border-[#ead3be] bg-[linear-gradient(135deg,rgba(255,250,244,0.98),rgba(248,236,220,0.9))] p-5 shadow-glow sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-10 h-44 w-44 rounded-full bg-[#c98a2a]/12 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#8c4b38]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-[#ead3be] bg-white/80 px-4 py-2 text-sm font-medium tracking-[0.22em] text-[#8c4b38] shadow-sm">
                Flodesk Form
              </div>

              <div className="space-y-4">
                <h2 className="font-display text-4xl leading-tight text-[#2b1d18] sm:text-5xl lg:text-6xl">
                  A refined form experience that still runs entirely inside Flodesk
                </h2>
                <p className="max-w-2xl text-base leading-7 text-[#5f5048] sm:text-lg sm:leading-8">
                  Capture leads with the native Flodesk embed, preserve your automations, and present the form in a
                  softer premium frame that matches the rest of the landing page beautifully.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TrustChip text="Native Flodesk submission" />
                <TrustChip text="Automation stays intact" />
                <TrustChip text="Responsive on mobile" />
                <TrustChip text="Premium landing page styling" />
              </div>

              <div className="rounded-[28px] border border-[#ead3be] bg-white/70 p-5 text-sm leading-7 text-[#5f5048] shadow-sm">
                The embed below is the real live Flodesk form. Styling around it has been redesigned, but the action,
                fields, hidden tracking, and redirect behavior are unchanged.
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-[42px] bg-gradient-to-br from-[#8c4b38]/10 via-transparent to-[#c98a2a]/15 blur-xl" />
              <div className="relative rounded-[36px] border border-[#ead3be] bg-white/80 p-3 shadow-[0_22px_60px_rgba(95,53,42,0.14)] sm:p-4">
                <FlodeskEmbed />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-18">
        <div className="rounded-[34px] border border-[#ead3be] bg-gradient-to-r from-[#6a2f27] via-[#8c4b38] to-[#c98a2a] p-8 text-white shadow-glow sm:p-12">
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.28em] text-white/75">Final CTA</div>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Ready to turn your favorite photo into something unforgettable?</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90">
              Order now and let us create a beautiful photo product you can keep, display, or gift with pride.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/checkout" className="rounded-full bg-white px-6 py-3.5 text-center font-semibold text-[#6a2f27] transition hover:bg-[#f7eadc]">
              Purchase Now
            </Link>
            <Link href="/checkout" className="rounded-full border border-white/70 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10">
              Order Now
            </Link>
            <Link href="/checkout" className="rounded-full border border-white/70 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10">
              Buy Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function TrustChip({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#ead3be] bg-white/75 px-4 py-3 shadow-sm">
      {text}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-[#ead3be] bg-white/85 p-5 shadow-sm">
      <div className="text-sm uppercase tracking-[0.24em] text-[#8c4b38]">{label}</div>
      <div className="mt-2 font-display text-2xl text-[#2b1d18]">{value}</div>
    </div>
  )
}
