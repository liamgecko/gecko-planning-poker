"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}

/**
 * Positions around the table (3x3 grid).
 * Cardinal first: top, right, bottom, left. Then corners: top-right, bottom-right, bottom-left, top-left.
 */
const GRID_POSITIONS: { col: number; row: number }[] = [
  { col: 1, row: 0 },
  { col: 2, row: 1 },
  { col: 1, row: 2 },
  { col: 0, row: 1 },
  { col: 2, row: 0 },
  { col: 2, row: 2 },
  { col: 0, row: 2 },
  { col: 0, row: 0 },
]

/**
 * Arranges children around a table using CSS Grid.
 */
export function TableLayout({ children, className }: Props) {
  const items = useMemo(
    () => React.Children.toArray(children).filter(Boolean),
    [children]
  )

  return (
    <div
      className={cn(
        "grid w-full max-w-sm mx-auto gap-4",
        "grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto]",
        "items-center justify-items-center",
        className
      )}
    >
      {items.map((child, i) => {
        const { col, row } = GRID_POSITIONS[i % GRID_POSITIONS.length]
        return (
          <div
            key={i}
            className="flex flex-col items-center justify-center w-20 min-w-20 max-w-20 shrink-0"
            style={{ gridColumn: col + 1, gridRow: row + 1 }}
          >
            {child}
          </div>
        )
      })}
      <div
        className="w-28 h-20 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 col-start-2 row-start-2"
        aria-hidden
      />
    </div>
  )
}
