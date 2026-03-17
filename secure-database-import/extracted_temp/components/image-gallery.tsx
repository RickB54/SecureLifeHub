"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Plus, Maximize2, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/lib/use-local-storage"

interface Image {
  id: string
  url: string // Will store base64 string
  thumbnail: string // Will store base64 string
  caption: string
}

interface ImageGalleryProps {
  recordId: string
  onClose: () => void
  onImagesChange?: (count: number) => void
  databaseColor?: any
}

export function ImageGallery({ recordId, onClose, onImagesChange, databaseColor }: ImageGalleryProps) {
  const [images, setImages] = useLocalStorage<{ [key: string]: Image[] }>("recordImages", {})
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const recordImages = images[recordId] || []

  // Update selected index when image changes
  useEffect(() => {
    if (selectedImage) {
      const index = recordImages.findIndex((img) => img.id === selectedImage.id)
      setSelectedIndex(index)
    }
  }, [selectedImage, recordImages])

  // Update database record and notify parent of image count changes
  const updateImages = useCallback(
    (newImages: Image[]) => {
      // Update images in localStorage
      setImages((prev) => ({
        ...prev,
        [recordId]: newImages,
      }))

      // Get the latest databases from localStorage
      const customDatabases = JSON.parse(localStorage.getItem("customDatabases") || "[]")
      const updatedDatabases = customDatabases.map((db: any) => ({
        ...db,
        records: db.records.map((record: any) => {
          if (record.id === recordId) {
            return {
              ...record,
              values: {
                ...record.values,
                Gallery: newImages, // Store the complete image objects
              },
              lastUpdated: new Date().toISOString(),
            }
          }
          return record
        }),
      }))

      // Save back to localStorage
      localStorage.setItem("customDatabases", JSON.stringify(updatedDatabases))

      // Notify parent component of image count change
      onImagesChange?.(newImages.length)
    },
    [recordId, setImages, onImagesChange],
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: Image[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Convert file to base64
        const [fullImage, thumbnail] = await Promise.all([fileToBase64(file), createThumbnail(file)])

        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          url: fullImage,
          thumbnail,
          caption: file.name,
        })
      } catch (error) {
        console.error("Error processing image:", error)
      }
    }

    updateImages([...recordImages, ...newImages])
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const createThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          const maxSize = 100

          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height = height * (maxSize / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = width * (maxSize / height)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          ctx?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", 0.7))
        }
        img.onerror = () => reject(new Error("Error loading image"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Error reading file"))
      reader.readAsDataURL(file)
    })
  }

  const deleteImage = (imageId: string) => {
    const updatedImages = recordImages.filter((img) => img.id !== imageId)
    updateImages(updatedImages)

    if (selectedImage?.id === imageId) {
      if (updatedImages.length > 0) {
        const newIndex = Math.min(selectedIndex, updatedImages.length - 1)
        setSelectedImage(updatedImages[newIndex])
      } else {
        setSelectedImage(null)
      }
    }
  }

  const downloadImage = (image: Image) => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = image.caption
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage || recordImages.length <= 1) return

    const newIndex =
      direction === "next"
        ? (selectedIndex + 1) % recordImages.length
        : (selectedIndex - 1 + recordImages.length) % recordImages.length

    setSelectedImage(recordImages[newIndex])
  }

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const swipeDistance = touchEndX.current - touchStartX.current
    const minSwipeDistance = 50 // minimum distance for swipe to register

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        navigateImage("prev")
      } else {
        navigateImage("next")
      }
    }

    // Reset touch coordinates
    touchStartX.current = null
    touchEndX.current = null
  }

  const headerClass = databaseColor ? `${databaseColor.background} ${databaseColor.border} border-b` : "border-b"
  const buttonClass = databaseColor ? databaseColor.accent : ""

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className={`flex justify-between items-center mb-4 -mx-6 -mt-6 px-6 py-4 ${headerClass}`}>
            <h2 className={`text-lg font-semibold ${databaseColor?.text || ""}`}>
              Image Gallery ({recordImages.length})
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {recordImages.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer border-2 rounded-md overflow-hidden ${databaseColor?.border || "border-border"}`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.thumbnail || "/placeholder.svg"}
                  alt={image.caption}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-90 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteImage(image.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div
              className={`flex items-center justify-center h-24 border-2 border-dashed rounded-md ${databaseColor?.border || "border-border"}`}
            >
              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} multiple />
                <Plus className={`h-8 w-8 ${databaseColor?.text || "text-muted-foreground"}`} />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className={buttonClass} onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <Dialog open={true} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className={isFullscreen ? "max-w-none w-screen h-screen p-0" : "max-w-4xl"}>
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <span className={`${databaseColor?.background || "bg-background/80"} px-2 py-1 rounded-md text-sm`}>
                  {selectedIndex + 1} / {recordImages.length}
                </span>
                <Button variant="ghost" size="icon" onClick={() => downloadImage(selectedImage)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {recordImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateImage("prev")
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateImage("next")
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <img
                src={selectedImage.url || "/placeholder.svg"}
                alt={selectedImage.caption}
                className={`w-full ${isFullscreen ? "h-screen object-contain" : "max-h-[70vh] object-contain"}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

