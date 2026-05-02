import { useEffect, useMemo, useState } from 'react'
import {
  MdArrowBack,
  MdContentCopy,
  MdDelete,
  MdDownload,
  MdFileUpload,
  MdInventory2,
  MdPublishedWithChanges,
  MdSave,
  MdSearch,
} from 'react-icons/md'
import {
  clearEquipment,
  EQUIPMENT_DATABASE_INFO,
  getAllEquipment,
  replaceEquipmentBatch,
  saveEquipmentBatch,
} from './utils/equipmentDatabase.js'
import {
  createEquipmentSeedExport,
  fetchHostedEquipmentSeed,
  getEquipmentSeedUrl,
  getStoredEquipmentSeedSignature,
  parseEquipmentSeedJson,
  setStoredEquipmentSeedSignature,
} from './utils/equipmentSeed.js'
import { getEquipmentSummary, labelFromId, parseFoundryEquipmentJson } from './utils/foundryEquipment.js'

const FOUNDRY_EXPORT_SCRIPT = `const pack = game.packs.get('pf2e.equipment-srd');
const items = await pack.getDocuments();
const equipment = items.map((item) => item.toObject());
const json = JSON.stringify(equipment, null, 2);
try {
  await navigator.clipboard.writeText(json);
  ui.notifications.info(\`Copied \${equipment.length} equipment items.\`);
} catch {
  console.log(json);
  ui.notifications.warn('Clipboard was blocked. Equipment JSON was printed to the console instead.');
}`

const sortEquipment = (equipment) =>
  [...equipment].sort((first, second) => first.name.localeCompare(second.name))

const parseEquipmentJson = (value) => {
  const parsed = JSON.parse(value)

  if (Array.isArray(parsed?.items) || parsed?.schemaVersion) {
    const seed = parseEquipmentSeedJson(parsed)

    return {
      equipment: seed.items,
      seedSignature: seed.signature,
      source: 'website',
    }
  }

  return {
    equipment: parseFoundryEquipmentJson(value),
    seedSignature: '',
    source: 'foundry',
  }
}

const downloadJson = (filename, data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function EquipmentImporter({ onBackHome }) {
  const [jsonInput, setJsonInput] = useState('')
  const [equipment, setEquipment] = useState([])
  const [previewEquipment, setPreviewEquipment] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [previewSeedSignature, setPreviewSeedSignature] = useState('')
  const [hostedSeed, setHostedSeed] = useState(null)
  const [hostedSeedStatus, setHostedSeedStatus] = useState('Checking website JSON...')
  const [isImportingHostedSeed, setIsImportingHostedSeed] = useState(false)

  const loadStoredEquipment = async () => {
    const storedEquipment = await getAllEquipment()
    setEquipment(sortEquipment(storedEquipment))
  }

  useEffect(() => {
    let isMounted = true

    getAllEquipment()
      .then((storedEquipment) => {
        if (isMounted) setEquipment(sortEquipment(storedEquipment))
      })
      .catch((nextError) => {
        if (isMounted) setError(nextError.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchHostedEquipmentSeed()
      .then((seed) => {
        if (!isMounted) return

        setHostedSeed(seed)

        if (!seed) {
          setHostedSeedStatus(`No website JSON found at ${getEquipmentSeedUrl()}.`)
          return
        }

        if (seed.items.length === 0) {
          setHostedSeedStatus(`Website JSON is present at ${getEquipmentSeedUrl()}, but it has no items yet.`)
          return
        }

        const storedSignature = getStoredEquipmentSeedSignature()
        setHostedSeedStatus(
          storedSignature === seed.signature
            ? `IndexedDB is synced with website JSON version ${seed.version}.`
            : `Website JSON version ${seed.version} is available for import.`,
        )
      })
      .catch((nextError) => {
        if (isMounted) setHostedSeedStatus(nextError.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredEquipment = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return equipment.slice(0, 80)

    return equipment
      .filter((item) =>
        [
          item.name,
          item.rarity,
          item.type,
          item.sourceBook,
          item.price,
          item.bulk,
          item.traits.join(' '),
          (item.lootCategories ?? []).join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(search),
      )
      .slice(0, 80)
  }, [equipment, query])

  const summary = useMemo(() => getEquipmentSummary(equipment), [equipment])

  const previewImport = (value = jsonInput) => {
    try {
      const { equipment: nextEquipment, seedSignature } = parseEquipmentJson(value)
      setPreviewEquipment(sortEquipment(nextEquipment))
      setPreviewSeedSignature(seedSignature)
      setStatus(`Ready to import ${nextEquipment.length.toLocaleString()} equipment records.`)
      setError('')
      return nextEquipment
    } catch (nextError) {
      setPreviewEquipment([])
      setPreviewSeedSignature('')
      setStatus('')
      setError(nextError.message)
      return []
    }
  }

  const importEquipment = async () => {
    const nextEquipment = previewEquipment.length > 0 ? previewEquipment : previewImport()

    if (nextEquipment.length === 0) {
      setError('No equipment records were found in that JSON.')
      return
    }

    await saveEquipmentBatch(nextEquipment)
    if (previewSeedSignature) {
      setStoredEquipmentSeedSignature(previewSeedSignature)
    }
    await loadStoredEquipment()
    setStatus(`Imported ${nextEquipment.length.toLocaleString()} equipment records into IndexedDB.`)
    setError('')
  }

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setJsonInput(text)
    previewImport(text)
    event.target.value = ''
  }

  const clearStoredEquipment = async () => {
    await clearEquipment()
    setEquipment([])
    setStatus('Cleared the equipment object store.')
    setError('')
  }

  const exportWebsiteJson = () => {
    const seedExport = createEquipmentSeedExport(equipment)
    downloadJson('equipment-seed.json', seedExport)
    setStatus('Exported compact website JSON. Put this file at public/data/equipment-seed.json before deploying.')
    setError('')
  }

  const importHostedSeed = async () => {
    if (!hostedSeed || hostedSeed.items.length === 0) return

    setIsImportingHostedSeed(true)
    setError('')

    try {
      await replaceEquipmentBatch(hostedSeed.items)
      setStoredEquipmentSeedSignature(hostedSeed.signature)
      await loadStoredEquipment()
      setHostedSeedStatus(`IndexedDB is synced with website JSON version ${hostedSeed.version}.`)
      setStatus(`Reimported ${hostedSeed.items.length.toLocaleString()} records from website JSON.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setIsImportingHostedSeed(false)
    }
  }

  const copyFoundryScript = async () => {
    await navigator.clipboard.writeText(FOUNDRY_EXPORT_SCRIPT)
    setStatus('Copied the Foundry export script.')
  }

  return (
    <main className="equipment-shell">
      <header className="workspace-top-bar">
        <button type="button" className="home-back-button" onClick={onBackHome}>
          <MdArrowBack aria-hidden="true" />
          Home
        </button>
        <div>
          <p className="workspace-kicker">PF2e data tools</p>
          <h1>Equipment Importer</h1>
          <p>Normalize Foundry PF2e equipment records and store them in browser IndexedDB.</p>
        </div>
      </header>

      <section className="equipment-workspace" aria-label="Equipment importer workspace">
        <section className="equipment-panel equipment-import-panel">
          <div className="equipment-panel-heading">
            <MdInventory2 aria-hidden="true" />
            <div>
              <h2>Import Source</h2>
              <p>
                Paste JSON from Foundry, or load an exported JSON file. Records are keyed by item slug.
              </p>
            </div>
          </div>

          <div className="equipment-script-box">
            <div>
              <strong>Foundry console export</strong>
              <span>Copies `pf2e.equipment-srd` item JSON to your clipboard.</span>
            </div>
            <button type="button" onClick={copyFoundryScript}>
              <MdContentCopy aria-hidden="true" />
              Copy Script
            </button>
          </div>

          <label className="equipment-field" htmlFor="equipment-json">
            <span>Equipment JSON</span>
            <textarea
              id="equipment-json"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              placeholder="Paste the JSON array copied from Foundry here."
            />
          </label>

          <div className="equipment-actions">
            <label className="button equipment-file-button" htmlFor="equipment-json-file">
              <MdFileUpload aria-hidden="true" />
              Load JSON
              <input id="equipment-json-file" type="file" accept="application/json,.json" onChange={importFile} />
            </label>
            <button type="button" onClick={() => previewImport()}>
              Preview
            </button>
            <button type="button" className="primary-action" onClick={importEquipment}>
              <MdSave aria-hidden="true" />
              Import to IndexedDB
            </button>
          </div>

          {(status || error) && (
            <p className={`equipment-status ${error ? 'is-error' : ''}`} role="status">
              {error || status}
            </p>
          )}
        </section>

        <section className="equipment-panel equipment-results-panel">
          <div className="equipment-results-toolbar">
            <div>
              <h2>IndexedDB Equipment</h2>
              <p>
                Database `{EQUIPMENT_DATABASE_INFO.databaseName}`, store `{EQUIPMENT_DATABASE_INFO.storeName}`.
              </p>
            </div>
            <div className="equipment-toolbar-actions">
              <button type="button" onClick={exportWebsiteJson} disabled={equipment.length === 0}>
                <MdDownload aria-hidden="true" />
                Export Website JSON
              </button>
              <button type="button" onClick={() => downloadJson('pf2e-equipment-indexeddb.json', equipment)} disabled={equipment.length === 0}>
                <MdDownload aria-hidden="true" />
                Export
              </button>
              <button type="button" onClick={clearStoredEquipment} disabled={equipment.length === 0}>
                <MdDelete aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>

          <div className="equipment-seed-sync">
            <div>
              <strong>Website JSON sync</strong>
              <span>{hostedSeedStatus}</span>
            </div>
            <button
              type="button"
              onClick={importHostedSeed}
              disabled={!hostedSeed || hostedSeed.items.length === 0 || hostedSeed.signature === getStoredEquipmentSeedSignature() || isImportingHostedSeed}
            >
              <MdPublishedWithChanges aria-hidden="true" />
              {isImportingHostedSeed ? 'Importing...' : 'Reimport Website JSON'}
            </button>
          </div>

          <div className="equipment-summary-grid">
            <article>
              <span>Stored</span>
              <strong>{equipment.length.toLocaleString()}</strong>
            </article>
            <article>
              <span>Preview</span>
              <strong>{previewEquipment.length.toLocaleString()}</strong>
            </article>
            <article>
              <span>Rarities</span>
              <strong>{Object.keys(summary.rarities).length}</strong>
            </article>
            <article>
              <span>Types</span>
              <strong>{Object.keys(summary.types).length}</strong>
            </article>
            <article>
              <span>Loot Categories</span>
              <strong>{Object.keys(summary.lootCategories).length}</strong>
            </article>
          </div>

          <label className="equipment-search" htmlFor="equipment-search">
            <MdSearch aria-hidden="true" />
            <input
              id="equipment-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search imported equipment"
            />
          </label>

          <div className="equipment-table-wrap">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Bulk</th>
                  <th>Source</th>
                  <th>Traits</th>
                  <th>Rarity</th>
                  <th>Type</th>
                  <th>Loot Categories</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.slug}>
                    <td>{item.name}</td>
                    <td>{item.bulk}</td>
                    <td>{item.sourceBook}</td>
                    <td>{item.traits.map(labelFromId).join(', ')}</td>
                    <td>{labelFromId(item.rarity)}</td>
                    <td>{labelFromId(item.type)}</td>
                    <td>{(item.lootCategories ?? []).map(labelFromId).join(', ') || 'Uncategorized'}</td>
                    <td>{item.price}</td>
                  </tr>
                ))}
                {filteredEquipment.length === 0 && (
                  <tr>
                    <td colSpan="8">No imported equipment yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}
