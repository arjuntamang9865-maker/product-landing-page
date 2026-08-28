import { siteConfig } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/50 bg-[#f3e6d7]/80 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-[#6b5b52] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="font-semibold text-[#2b1d18]">{siteConfig.brandName}</div>
          <div>Contact: {siteConfig.contactNumber}</div>
        </div>
        <div className="max-w-xl text-right leading-6">
          Beautiful framed photo products delivered across Nepal. Chitwan delivery is free. Outside Chitwan: {siteConfig.currency} 170 delivery fee.
        </div>
      </div>
    </footer>
  )
}
