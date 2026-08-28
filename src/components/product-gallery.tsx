'use client'

import Image from 'next/image'
import { useState } from 'react'

export function ProductGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[32px] border border-[#ead3be] bg-white/75 p-3 shadow-glow">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-[#f5ebdf]">
          <Image src={images[activeIndex]} alt={`Bobin Foto Product image ${activeIndex + 1}`} fill className="object-cover" priority={activeIndex === 0} />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
              index === activeIndex ? 'border-[#8c4b38] shadow-glow' : 'border-transparent opacity-80 hover:opacity-100'
            }`}
          >
            <Image src={image} alt={`Gallery thumbnail ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-[#6f5c53]">
        <span>Swipe through the framed product shots</span>
        <span>{activeIndex + 1}/{images.length}</span>
      </div>
    </div>
  )
}
