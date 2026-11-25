"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HealthTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  ariaLabel?: string
  className?: string
  delayDuration?: number
}

/**
 * Shared accessible Tooltip for all Health Hub icon buttons and controls.
 * Uses Radix Portal with ultra-high z-index so tooltips are never clipped by modals or sticky bars.
 */
export function HealthTooltip({
  content,
  children,
  side = "top",
  align = "center",
  ariaLabel,
  className,
  delayDuration = 200,
}: HealthTooltipProps) {
  if (!content) return children

  const derivedLabel =
    ariaLabel || (typeof content === "string" ? content : undefined)

  const childProps = (children as React.ReactElement<any>).props || {}
  const enhancedChild =
    derivedLabel && !childProps["aria-label"]
      ? React.cloneElement(children as React.ReactElement<any>, {
          "aria-label": derivedLabel,
        })
      : children

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {enhancedChild}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={10}
            className={cn(
              "z-[100100] max-w-[260px] rounded-lg border border-white/15 bg-[#16161c] px-2.5 py-1.5 text-xs font-medium leading-snug text-gray-100 shadow-xl animate-in fade-in-0 zoom-in-95 pointer-events-none",
              className
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export interface FieldHelpPopoverProps {
  title: string
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

/**
 * Touch-friendly "?" help icon beside complex fields.
 * Shows a hover tooltip on desktop mouse AND opens a short popover when tapped on touch/mobile devices.
 */
export function FieldHelpPopover({
  title,
  content,
  side = "top",
  className,
}: FieldHelpPopoverProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <HealthTooltip content={typeof content === "string" ? content : `Help: ${title}`} side={side}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((prev) => !prev)
            }}
            aria-label={`Help: ${title}`}
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:text-purple-300 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors cursor-pointer shrink-0 align-middle",
              className
            )}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </PopoverPrimitive.Trigger>
      </HealthTooltip>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align="center"
          sideOffset={6}
          collisionPadding={12}
          onClick={(e) => e.stopPropagation()}
          className="z-[100110] w-72 rounded-xl border border-white/15 bg-[#181820] p-3 text-xs text-gray-200 shadow-2xl outline-none animate-in fade-in-0 zoom-in-95 space-y-1"
        >
          <div className="font-bold text-white text-xs">{title}</div>
          <div className="text-gray-300 leading-relaxed">{content}</div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
