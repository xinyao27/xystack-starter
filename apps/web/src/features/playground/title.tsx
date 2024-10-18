import { presets } from '~/features/playground/data/presets'
import { CodeViewer } from '~/features/playground/code-viewer'
import { PresetActions } from '~/features/playground/preset-actions'
import { PresetSave } from '~/features/playground/preset-save'
import { PresetSelector } from '~/features/playground/preset-selector'
import { PresetShare } from '~/features/playground/preset-share'

export function Title() {
  return (
    <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
      <h2 className="text-lg font-semibold">Playground</h2>
      <div className="ml-auto flex w-full space-x-2 sm:justify-end">
        <PresetSelector presets={presets} />
        <PresetSave />
        <div className="hidden space-x-2 md:flex">
          <CodeViewer />
          <PresetShare />
        </div>
        <PresetActions />
      </div>
    </div>
  )
}
