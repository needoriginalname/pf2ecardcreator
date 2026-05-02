const DATABASE_NAME = 'pf2e-card-project'
const DATABASE_VERSION = 1
const EQUIPMENT_STORE = 'equipment'

const openEquipmentDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(EQUIPMENT_STORE)) {
        const store = database.createObjectStore(EQUIPMENT_STORE, { keyPath: 'slug' })
        store.createIndex('name', 'name', { unique: false })
        store.createIndex('rarity', 'rarity', { unique: false })
        store.createIndex('type', 'type', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const runEquipmentTransaction = async (mode, callback) => {
  const database = await openEquipmentDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(EQUIPMENT_STORE, mode)
    const store = transaction.objectStore(EQUIPMENT_STORE)
    const result = callback(store)

    transaction.oncomplete = () => {
      database.close()
      resolve(result)
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
    transaction.onabort = () => {
      database.close()
      reject(transaction.error)
    }
  })
}

export const getAllEquipment = () =>
  runEquipmentTransaction('readonly', (store) => {
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })

export const saveEquipmentBatch = (equipment) =>
  runEquipmentTransaction('readwrite', (store) => {
    equipment.forEach((item) => store.put(item))
    return equipment.length
  })

export const clearEquipment = () =>
  runEquipmentTransaction('readwrite', (store) => {
    store.clear()
    return true
  })

export const EQUIPMENT_DATABASE_INFO = {
  databaseName: DATABASE_NAME,
  storeName: EQUIPMENT_STORE,
}
