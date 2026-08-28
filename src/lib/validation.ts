import { getOrderTotal, siteConfig } from '@/lib/site'

export type OrderPayload = {
  fullName: string
  phoneNumber: string
  emailAddress: string
  exactLocation: string
  productName: string
  quantity: number
  pricePerPiece: number
  totalPrice: number
}

export type OrderRecord = OrderPayload & {
  orderId: string
  dateTime: string
  paymentMethod: 'Cash On Delivery'
  orderStatus: 'New Order'
  notes: string
  deliveryFee: number
}

export function parseOrderPayload(input: unknown): OrderPayload {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid order payload.')
  }

  const payload = input as Record<string, unknown>
  const fullName = stringField(payload.fullName, 'Name is required.')
  const phoneNumber = stringField(payload.phoneNumber, 'Phone number is required.')
  const emailAddress = stringField(payload.emailAddress, 'Email address is required.')
  const exactLocation = stringField(payload.exactLocation, 'Location is required.')
  const productName = stringField(payload.productName, 'Product name is required.')
  const quantity = numberField(payload.quantity, 'Quantity must be at least 1.')
  const pricePerPiece = numberField(payload.pricePerPiece, 'Price per piece must be valid.')
  const totalPrice = numberField(payload.totalPrice, 'Total price must be valid.')

  if (!isValidEmail(emailAddress)) {
    throw new Error('Email must be valid.')
  }

  if (quantity < 1) {
    throw new Error('Quantity must be at least 1.')
  }

  if (!Number.isInteger(quantity)) {
    throw new Error('Quantity must be a whole number.')
  }

  if (pricePerPiece <= 0 || pricePerPiece !== siteConfig.price) {
    throw new Error('Price per piece must be valid.')
  }

  const expectedTotal = getOrderTotal(quantity, exactLocation)
  if (Math.abs(expectedTotal - totalPrice) > 0.5) {
    throw new Error('Total price does not match the selected quantity and delivery area.')
  }

  if (productName !== siteConfig.productName) {
    throw new Error('Product name does not match the configured product.')
  }

  return {
    fullName,
    phoneNumber,
    emailAddress,
    exactLocation,
    productName,
    quantity,
    pricePerPiece,
    totalPrice
  }
}

function stringField(value: unknown, message: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(message)
  }
  return value.trim()
}

function numberField(value: unknown, message: string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(message)
  }
  return parsed
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
