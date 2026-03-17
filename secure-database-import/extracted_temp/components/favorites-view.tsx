"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ImageGallery } from "./image-gallery"
import { getDatabaseColor, getRecordColor } from "@/lib/utils"
import type { Record, Database } from "@/lib/types"

interface FavoritesViewProps {
  favorites: Record[]
  onSelectFavorite: (recordId: string) => void
  databases?: Database[] // Make databases optional
}

export function FavoritesView({ favorites, onSelectFavorite, databases = [] }: FavoritesViewProps) {
  const [showGallery, setShowGallery] = useState<string | null>(null)

  // Function to get the database a record belongs to - with safety checks
  const getRecordDatabase = (record: Record): Database | undefined => {
    if (!databases || !Array.isArray(databases)) return undefined

    return databases.find((db) => db.records && Array.isArray(db.records) && db.records.some((r) => r.id === record.id))
  }

  // Function to get gallery count for a record - with safety checks
  const getGalleryCount = (recordId: string): number => {
    try {
      const recordImages = JSON.parse(localStorage.getItem("recordImages") || "{}")
      return (recordImages[recordId] || []).length
    } catch (error) {
      console.error("Error getting gallery count:", error)
      return 0
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold">Favorites</h2>
        <Star className="ml-2 h-5 w-5 text-yellow-500" />
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No favorites yet</p>
            <p className="text-sm mt-2">Star records to add them to your favorites for quick access</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((record) => {
              const recordDb = getRecordDatabase(record)
              const recordColor = getRecordColor(record.id)
              const galleryCount = getGalleryCount(record.id)
              const dbColor = recordDb ? getDatabaseColor(recordDb.title) : undefined

              return (
                <Card
                  key={record.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow border-2 ${recordColor.border}`}
                >
                  <CardHeader className={`pb-2 ${recordColor.background}`}>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className={`truncate ${recordColor.text}`}>
                        {Object.values(record.values)[0] || "Untitled Record"}
                      </span>
                      <div className="flex items-center gap-2">
                        {galleryCount > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 relative"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowGallery(record.id)
                            }}
                          >
                            <ImageIcon className="h-4 w-4" />
                            <Badge
                              variant="secondary"
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                            >
                              {galleryCount}
                            </Badge>
                          </Button>
                        )}
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      </div>
                    </CardTitle>
                    {recordDb && <div className="text-xs text-muted-foreground">From: {recordDb.title}</div>}
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Button variant="outline" className="w-full" onClick={() => onSelectFavorite(record.id)}>
                      View Record
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {showGallery && (
        <ImageGallery
          recordId={showGallery}
          onClose={() => setShowGallery(null)}
          onImagesChange={() => {
            // Force re-render to update gallery counts
            setShowGallery(null)
            setTimeout(() => setShowGallery(showGallery), 10)
          }}
          databaseColor={(() => {
            const record = favorites.find((r) => r.id === showGallery)
            if (!record) return ""
            const db = getRecordDatabase(record)
            return db ? getDatabaseColor(db.title) : ""
          })()}
        />
      )}
    </div>
  )
}

