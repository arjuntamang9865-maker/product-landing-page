'use client'

import { useEffect, useRef, useState } from 'react'

type SyncStatusResponse = {
  success: boolean
  orderId?: string
  syncStatus?: 'processing' | 'synced' | 'queued' | 'failed'
  syncWarnings?: string[]
  message?: string
}

type StatusVariant = 'processing' | 'success' | 'error'

type Props = {
  orderId: string
  initialStatus?: StatusVariant
  initialMessage?: string
  initialError?: string
  initialStage?: string
}

export function OrderSyncStatus({
  orderId,
  initialStatus = 'processing',
  initialMessage,
  initialError,
  initialStage
}: Props) {
  const [variant, setVariant] = useState<StatusVariant>(initialStatus)
  const [message, setMessage] = useState(
    initialMessage ||
      (initialStatus === 'success'
        ? 'Order received successfully.'
        : initialStatus === 'error'
          ? initialError || 'We received a problem while processing your order.'
          : 'Sending your order to Google Sheets and email...')
  )
  const [details, setDetails] = useState<string | null>(initialError || null)
  const variantRef = useRef<StatusVariant>(initialStatus)

  useEffect(() => {
    variantRef.current = variant
  }, [variant])

  useEffect(() => {
    let cancelled = false
    let retryAttempted = false

    async function loadStatus() {
      try {
        const response = await fetch(`/api/order/status?orderId=${encodeURIComponent(orderId)}`, {
          cache: 'no-store'
        })
        const data = (await readJson(response)) as SyncStatusResponse

        if (cancelled) return

        if (!response.ok || !data.success) {
          setVariant('error')
          setMessage('We received a problem while processing your order.')
          setDetails(data.message || 'We could not read the order status.')
          return
        }

        if (data.syncStatus === 'synced') {
          setVariant('success')
          setMessage('Order received successfully.')
          setDetails(null)
          return
        }

        if ((data.syncStatus === 'queued' || data.syncStatus === 'processing') && !retryAttempted) {
          retryAttempted = true
          setVariant('processing')
          setMessage('Sending your order to Google Sheets and email...')

          const retryResponse = await fetch('/api/order/retry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
          })
          const retryData = (await readJson(retryResponse)) as {
            success: boolean
            results?: Array<{ orderId: string; synced: boolean; warnings: string[] }>
          }

          if (cancelled) return

          const retryResult = retryData.results?.find((item) => item.orderId === orderId)

          if (retryResult?.synced) {
            setVariant('success')
            setMessage('Order received successfully.')
            setDetails(null)
            return
          }

          const warnings = retryResult?.warnings || data.syncWarnings || []
          const firstWarning = warnings[0]
          const shouldShowError = !retryResult || !retryData.success || warnings.length > 0

          if (shouldShowError) {
            setVariant('error')
            setMessage('We received a problem while processing your order.')
            setDetails(firstWarning || 'The order was saved, but external delivery is still pending.')
            return
          }
        }

        setVariant('processing')
        setMessage('We received your order and are confirming it in the background.')
        setDetails(null)
      } catch (error) {
        if (cancelled) return

        setVariant('error')
        setMessage('We received a problem while processing your order.')
        setDetails(error instanceof Error ? error.message : 'Unexpected status check failure.')
      }
    }

    const timeout = setTimeout(() => {
      if (!cancelled && variantRef.current === 'processing') {
        setVariant('error')
        setMessage('We received a problem while processing your order.')
        setDetails('The order is taking longer than expected to sync.')
      }
    }, 20000)

    loadStatus()

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [orderId, initialStatus, initialMessage, initialError, initialStage])

  const borderClass =
    variant === 'success' ? 'border-green-200 bg-green-50 text-green-800' : variant === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#ead3be] bg-[#f9efe4] text-[#5f5048]'

  return (
    <div className={`mt-6 rounded-2xl border p-4 text-left ${borderClass}`}>
      <div className="font-semibold text-[#8c4b38]">Order status</div>
      <div className="mt-1 text-sm">{message}</div>
      {details ? (
        <div className="mt-2 text-xs leading-6 opacity-90">{process.env.NODE_ENV === 'development' ? details : null}</div>
      ) : null}
    </div>
  )
}

async function readJson(response: Response) {
  const text = await response.text()

  if (!text.trim()) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return { success: false, message: text }
  }
}
