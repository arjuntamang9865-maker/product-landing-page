type Props = {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <div className="mb-3 text-sm font-semibold uppercase tracking-[0.26em] text-[#8c4b38]">{eyebrow}</div> : null}
      <h2 className="font-display text-3xl leading-tight text-[#2b1d18] sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-[#5f5048]">{description}</p> : null}
    </div>
  )
}
