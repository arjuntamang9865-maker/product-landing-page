import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(248,241,232,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt={siteConfig.brandName}
            width={140}
            height={140}
            className="h-16 w-auto object-contain sm:h-20 lg:h-24"
            priority
          />
        </Link>
        <div className="hidden items-center gap-3 text-sm text-[#5b4c44] md:flex">
          <span className="rounded-full border border-[#ead3be] bg-white/70 px-4 py-2">Call: {siteConfig.contactNumber}</span>
          <Link href="/checkout" className="rounded-full bg-[#8c4b38] px-5 py-2.5 font-semibold text-white shadow-glow transition hover:bg-[#6f382d]">
            Order Now
          </Link>
        </div>
      </div>
    </header>
  )
}
