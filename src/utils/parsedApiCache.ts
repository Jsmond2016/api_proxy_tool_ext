import type { ParsedApi } from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils"

const DB_NAME = "api-proxy-cache-db"
const DB_VERSION = 1
const STORE_NAME = "parsed-api-maps"
const CACHE_VERSION = 1

export const PARSED_API_CACHE_TTL = 24 * 60 * 60 * 1000

export interface ParsedApiCacheIdentity {
  url: string
  mode: "local" | "online"
}

interface ParsedApiCacheRecord {
  key: string
  version: number
  timestamp: number
  entries: Array<[string, ParsedApi]>
}

let databasePromise: Promise<IDBDatabase> | null = null

export const normalizeApiLookupPath = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ""

  try {
    return normalizePath(new URL(trimmed).pathname)
  } catch {
    const [pathOnly] = trimmed.split(/[?#]/)
    return normalizePath(pathOnly)
  }
}

export const createParsedApiMap = (
  parsedApis: ParsedApi[],
): Map<string, ParsedApi> =>
  parsedApis.reduce((map, api) => {
    map.set(normalizeApiLookupPath(api.path), api)
    return map
  }, new Map<string, ParsedApi>())

export const getCachedParsedApiMap = async (
  identity: ParsedApiCacheIdentity,
  now = Date.now(),
): Promise<Map<string, ParsedApi> | null> => {
  const key = await buildCacheKey(identity)
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, "readonly")
  const record = await requestToPromise<ParsedApiCacheRecord | undefined>(
    transaction.objectStore(STORE_NAME).get(key),
  )

  if (!isValidRecord(record, key, now)) {
    if (record) {
      await deleteCacheRecord(database, key)
    }
    return null
  }

  return new Map(record.entries)
}

export const setCachedParsedApis = async (
  identity: ParsedApiCacheIdentity,
  parsedApis: ParsedApi[],
  timestamp = Date.now(),
): Promise<Map<string, ParsedApi>> => {
  const map = createParsedApiMap(parsedApis)
  const key = await buildCacheKey(identity)
  const database = await openDatabase()
  const transaction = database.transaction(STORE_NAME, "readwrite")

  transaction.objectStore(STORE_NAME).put({
    key,
    version: CACHE_VERSION,
    timestamp,
    entries: Array.from(map.entries()),
  } satisfies ParsedApiCacheRecord)

  await waitForTransaction(transaction)
  return map
}

const normalizePath = (path: string): string => {
  const normalized = path.trim().replace(/\/{2,}/g, "/")
  if (!normalized) return ""
  if (normalized === "/") return normalized

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

const buildCacheKey = async ({
  url,
  mode,
}: ParsedApiCacheIdentity): Promise<string> => {
  const source = new TextEncoder().encode(`${mode}:${url.trim()}`)
  const digest = await crypto.subtle.digest("SHA-256", source)
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")

  return `${mode}:${hash}`
}

const openDatabase = (): Promise<IDBDatabase> => {
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      databasePromise = null
      reject(request.error || new Error("Failed to open parsed API cache"))
    }

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" })
      }
    }

    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = null
      }
      resolve(database)
    }
  })

  return databasePromise
}

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const waitForTransaction = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () =>
      reject(
        transaction.error || new Error("Parsed API cache transaction aborted"),
      )
  })

const deleteCacheRecord = async (
  database: IDBDatabase,
  key: string,
): Promise<void> => {
  const transaction = database.transaction(STORE_NAME, "readwrite")
  transaction.objectStore(STORE_NAME).delete(key)
  await waitForTransaction(transaction)
}

const isValidRecord = (
  record: ParsedApiCacheRecord | undefined,
  expectedKey: string,
  now: number,
): record is ParsedApiCacheRecord =>
  Boolean(
    record &&
    record.key === expectedKey &&
      record.version === CACHE_VERSION &&
      Number.isFinite(record.timestamp) &&
      record.timestamp <= now &&
      now - record.timestamp < PARSED_API_CACHE_TTL &&
    Array.isArray(record.entries) &&
    record.entries.every(isValidEntry),
  )

const isValidEntry = (entry: [string, ParsedApi]): boolean =>
  Array.isArray(entry) &&
  entry.length === 2 &&
  typeof entry[0] === "string" &&
  Boolean(entry[1]) &&
  typeof entry[1] === "object" &&
  typeof entry[1].path === "string" &&
  typeof entry[1].summary === "string"
