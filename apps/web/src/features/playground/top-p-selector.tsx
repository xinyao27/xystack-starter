'use client'

import * as React from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@xystack/ui/hover-card'
import { Label } from '@xystack/ui/label'
import { Slider } from '@xystack/ui/slider'
import type { SliderProps } from '@radix-ui/react-slider'

interface TopPSelectorProps {
  defaultValue: SliderProps['defaultValue']
}

export function TopPSelector({ defaultValue }: TopPSelectorProps) {
  const [value, setValue] = React.useState(defaultValue)

  return (
    <div className="grid gap-2 pt-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="top-p">Top P</Label>
              <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                {value}
              </span>
            </div>
            <Slider
              aria-label="Top P"
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              defaultValue={value}
              id="top-p"
              max={1}
              step={0.1}
              onValueChange={setValue}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-[260px] text-sm" side="left">
          Control diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
