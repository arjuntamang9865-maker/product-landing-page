'use client'

import { useEffect, useRef } from 'react'

const FLODESK_EMBED_URL = '/flodesk-embed.html'
const FLODESK_STYLE_MARKER = 'ff-6a92ba2410bdad593a9b9cf1'
const FLODESK_SANS_HREF = 'https://assets.flodesk.com/flodesk-sans.css'

export function FlodeskEmbed() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function mountEmbed() {
      const response = await fetch(FLODESK_EMBED_URL, { cache: 'force-cache' })
      const html = await response.text()
      if (cancelled || !rootRef.current) return

      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      syncHeadAssets(doc)
      injectEmbedMarkup(doc, rootRef.current)
      executeScripts(rootRef.current)
    }

    mountEmbed().catch((error) => {
      console.error('Failed to load Flodesk embed:', error)
    })

    return () => {
      cancelled = true
      if (rootRef.current) {
        rootRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="rounded-[34px] border border-[#ead3be] bg-[#fffaf4]/95 p-3 shadow-glow sm:p-5">
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div ref={rootRef} className="flodesk-embed-host" />
      </div>
    </div>
  )
}

function syncHeadAssets(doc: Document) {
  const headLinks = Array.from(doc.head.querySelectorAll('link, style'))

  headLinks.forEach((node) => {
    if (node.tagName === 'LINK') {
      const link = node as HTMLLinkElement
      if (link.href === FLODESK_SANS_HREF && !document.head.querySelector(`link[href="${FLODESK_SANS_HREF}"]`)) {
        document.head.appendChild(link.cloneNode(true))
      }
      return
    }

    if (node.tagName === 'STYLE') {
      const style = node as HTMLStyleElement
      if (style.textContent?.includes(FLODESK_STYLE_MARKER) && !document.head.querySelector(`[data-flodesk-style="${FLODESK_STYLE_MARKER}"]`)) {
        const clonedStyle = style.cloneNode(true) as HTMLStyleElement
        clonedStyle.setAttribute('data-flodesk-style', FLODESK_STYLE_MARKER)
        document.head.appendChild(clonedStyle)
      }
    }
  })
}

function injectEmbedMarkup(doc: Document, host: HTMLDivElement) {
  host.innerHTML = ''

  const fragment = document.createDocumentFragment()
  Array.from(doc.body.children).forEach((child) => {
    fragment.appendChild(child.cloneNode(true))
  })

  host.appendChild(fragment)
}

function executeScripts(host: HTMLDivElement) {
  const scripts = Array.from(host.querySelectorAll('script'))

  scripts.forEach((script) => {
    const replacement = document.createElement('script')

    Array.from(script.attributes).forEach((attribute) => {
      replacement.setAttribute(attribute.name, attribute.value)
    })

    if (script.textContent) {
      replacement.textContent = script.textContent
    }

    script.parentNode?.replaceChild(replacement, script)
  })
}
