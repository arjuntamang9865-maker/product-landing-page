type Testimonial = {
  name: string
  location: string
  quote: string
}

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {testimonials.map((item) => (
        <article key={item.name} className="rounded-[28px] border border-[#ead3be] bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
          <div className="mb-4 text-[#c98a2a]">★★★★★</div>
          <p className="text-sm leading-7 text-[#5f5048]">{item.quote}</p>
          <div className="mt-6">
            <div className="font-semibold text-[#2b1d18]">{item.name}</div>
            <div className="text-sm text-[#8d7b70]">{item.location}</div>
          </div>
        </article>
      ))}
    </div>
  )
}
