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
const memoryStore = {
  orders: [] as StoredOrder[],
  pending: [] as Array<OrderRecord & { syncWarnings: string[] }>
}

async function ensureDataDir() {
  try {
    await mkdir(dataDir, { recursive: true })
  } catch {
    // Some deployment environments do not allow writing to the repo filesystem.
  }
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
  try {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  } catch {
    // Fall back to in-memory storage when the runtime filesystem is read-only.
  }
}

export async function appendStoredOrder(order: StoredOrder) {
  await ensureDataDir()
  const orders = (await readJsonFile<StoredOrder[]>(ordersFile, memoryStore.orders)) || memoryStore.orders
  const index = orders.findIndex((item) => item.orderId === order.orderId)

  if (index >= 0) {
    orders[index] = order
  } else {
    orders.push(order)
  }

  memoryStore.orders = orders
  await writeJsonFile(ordersFile, orders)
}

export async function getStoredOrder(orderId: string) {
  await ensureDataDir()
  const orders = (await readJsonFile<StoredOrder[]>(ordersFile, memoryStore.orders)) || memoryStore.orders
  return orders.find((item) => item.orderId === orderId)
}

export async function queuePendingOrder(order: OrderRecord, syncWarnings: string[]) {
  await ensureDataDir()
  const pendingOrders =
    (await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, memoryStore.pending)) ||
    memoryStore.pending
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
  memoryStore.pending = pendingOrders
  await writeJsonFile(pendingFile, pendingOrders)
}

export async function getPendingOrders() {
  await ensureDataDir()
  return (await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, memoryStore.pending)) || memoryStore.pending
}

export async function getPendingOrder(orderId: string) {
  await ensureDataDir()
  const pendingOrders =
    (await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, memoryStore.pending)) ||
    memoryStore.pending
  return pendingOrders.find((item) => item.orderId === orderId)
}

export async function replacePendingOrders(
  pendingOrders: Array<OrderRecord & { syncWarnings: string[] }>
) {
  await ensureDataDir()
  memoryStore.pending = pendingOrders
  await writeJsonFile(pendingFile, pendingOrders)
}

export async function updateStoredOrderStatus(
  orderId: string,
  syncStatus: StoredOrder['syncStatus'],
  syncWarnings: string[]
) {
  await ensureDataDir()
  const orders = (await readJsonFile<StoredOrder[]>(ordersFile, memoryStore.orders)) || memoryStore.orders
  const index = orders.findIndex((item) => item.orderId === orderId)

  if (index >= 0) {
    orders[index] = {
      ...orders[index],
      syncStatus,
      syncWarnings
    }
    memoryStore.orders = orders
    await writeJsonFile(ordersFile, orders)
  }
}

export async function removePendingOrder(orderId: string) {
  await ensureDataDir()
  const pendingOrders =
    (await readJsonFile<Array<OrderRecord & { syncWarnings: string[] }>>(pendingFile, memoryStore.pending)) ||
    memoryStore.pending
  const remaining = pendingOrders.filter((item) => item.orderId !== orderId)
  memoryStore.pending = remaining
  await writeJsonFile(pendingFile, remaining)
}
