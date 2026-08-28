import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { OrderRecord } from '@/lib/validation'

export type SyncStatus = 'processing' | 'synced' | 'queued' | 'failed'

type StoredOrder = OrderRecord & {
  syncStatus: SyncStatus
  syncWarnings: string[]
}

const dataDir = path.join(process.cwd(), 'data')
const ordersFile = path.join(dataDir, 'orders.json')
const pendingFile = path.join(dataDir, 'pending-orders.json')

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true })
}

async function readJsonFile<T>(filePath: string, fallback: T) {
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function appendStoredOrder(order: StoredOrder) {
  await ensureDataDir()
  const orders = await readJsonFile<StoredOrder[]>(ordersFile, [])
  const index = orders.findIndex((item) => item.orderId === order.orderId)

  if (index >= 0) {
    orders[index] = order
  } else {
    orders.push(order)
  }

  await writeJsonFile(ordersFile, orders)
}

export async function getStoredOrder(orderId: string) {
  await ensureDataDir()
  const orders = await readJsonFile<StoredOrder[]>(ordersFile, [])
  return orders.find((item) => item.orderId === orderId)
}

export async function queuePendingOrder(order: OrderRecord, syncWarnings: string[]) {
  await ensureDataDir()
  const pendingOrders = await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, [])
  const existingIndex = pendingOrders.findIndex((item) => item.orderId === order.orderId)
  const pendingEntry = {
    ...order,
    syncWarnings
  }

  if (existingIndex >= 0) {
    pendingOrders[existingIndex] = pendingEntry
  } else {
    pendingOrders.push(pendingEntry)
  }
  await writeJsonFile(pendingFile, pendingOrders)
}

export async function getPendingOrders() {
  await ensureDataDir()
  return readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, [])
}

export async function getPendingOrder(orderId: string) {
  await ensureDataDir()
  const pendingOrders = await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, [])
  return pendingOrders.find((item) => item.orderId === orderId)
}

export async function replacePendingOrders(
  pendingOrders: Array<OrderRecord & { syncWarnings: string[] }>
) {
  await ensureDataDir()
  await writeJsonFile(pendingFile, pendingOrders)
}

export async function updateStoredOrderStatus(
  orderId: string,
  syncStatus: StoredOrder['syncStatus'],
  syncWarnings: string[]
) {
  await ensureDataDir()
  const orders = await readJsonFile<StoredOrder[]>(ordersFile, [])
  const index = orders.findIndex((item) => item.orderId === orderId)

  if (index >= 0) {
    orders[index] = {
      ...orders[index],
      syncStatus,
      syncWarnings
    }
    await writeJsonFile(ordersFile, orders)
  }
}

export async function removePendingOrder(orderId: string) {
  await ensureDataDir()
  const pendingOrders = await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, [])
  const remaining = pendingOrders.filter((item) => item.orderId !== orderId)
  await writeJsonFile(pendingFile, remaining)
}
