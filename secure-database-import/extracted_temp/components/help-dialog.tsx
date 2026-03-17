"use client"

import type React from "react"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HelpSection {
  id: string
  title: string
  content: React.ReactNode
}

interface HelpDialogProps {
  title: string
  sections: HelpSection[]
  trigger?: React.ReactNode
  defaultSection?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function HelpDialog({ title, sections, trigger, defaultSection, size = "lg" }: HelpDialogProps) {
  const [open, setOpen] = useState(false)

  const maxWidthClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }[size]

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`${maxWidthClass} h-[90vh] p-0 flex flex-col`}>
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={defaultSection || sections[0].id} className="flex-1 flex flex-col">
            <div className="px-6">
              <TabsList className="w-full justify-start border-b pb-0 h-auto">
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {sections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="h-full mt-0 p-0">
                  <ScrollArea className="h-[calc(90vh-8rem)]">
                    <div className="p-6 pt-4">{section.content}</div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

