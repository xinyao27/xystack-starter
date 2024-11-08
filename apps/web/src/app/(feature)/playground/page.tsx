import { Separator } from '@xystack/ui/separator'
import { Title } from '~/features/playground/title'
import { Main } from '~/features/playground/main'

export default function Playground() {
  return (
    <div className="hidden h-full flex-col md:flex">
      <Title />
      <Separator />
      <Main />
    </div>
  )
}
