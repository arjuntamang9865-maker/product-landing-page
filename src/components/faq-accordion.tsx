'use client'

import { useState } from 'react'

type Item = {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const open = index === active
        return (
          <button
            key={item.question}
            type="button"
            onClick={() => setActive(open ? -1 : index)}
            className="w-full rounded-3xl border border-[#ead3be] bg-white/90 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold text-[#2b1d18]">{item.question}</div>
              <div className="rounded-full bg-[#f7eadc] px-3 py-1 text-sm font-semibold text-[#8c4b38]">{open ? '−' : '+'}</div>
            </div>
            {open ? <div className="mt-4 text-sm leading-7 text-[#5f5048]">{item.answer}</div> : null}
          </button>
        )
      })}
    </div>
  )
}
