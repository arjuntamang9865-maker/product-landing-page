import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-16 text-center">
      <div className="rounded-[32px] border border-[#ead3be] bg-white/95 p-8 shadow-glow">
        <div className="font-display text-4xl text-[#2b1d18]">Page not found</div>
        <p className="mt-4 text-sm leading-7 text-[#5f5048]">
          The page you are looking for does not exist. Go back to the home page to continue browsing.
        </p>
        <div className="mt-6">
          <Link href="/" className="inline-flex rounded-full bg-[#8c4b38] px-6 py-3.5 font-semibold text-white transition hover:bg-[#6f382d]">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
