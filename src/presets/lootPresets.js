const presetModules = import.meta.glob('./loot/*.json', {
  eager: true,
  import: 'default',
})

const getPresetFileId = (path) => path.split('/').pop()?.replace(/\.json$/, '') ?? ''

export const BUILT_IN_PRESET_DEFINITIONS = Object.entries(presetModules)
  .map(([path, preset]) => ({
    ...preset,
    id: preset.id || getPresetFileId(path),
  }))
  .filter((preset) => preset.id && preset.name && preset.weights)
  .sort(
    (firstPreset, secondPreset) =>
      (firstPreset.order ?? Number.MAX_SAFE_INTEGER) -
        (secondPreset.order ?? Number.MAX_SAFE_INTEGER) ||
      firstPreset.name.localeCompare(secondPreset.name),
  )
