// @ts-nocheck
import React, { useState, useRef } from 'react';
import { X, Upload, Maximize2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onAddImages: (newImages: string[]) => void;
  onRemoveImage: (index: number) => void;
}

export default function ImageGallery({ images, onAddImages, onRemoveImage }: ImageGalleryProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;
    
    const maxFileSize = 500 * 1024; // 500KB
    const newImages: string[] = [];
    let totalSize = 0;

    // Calculate current storage usage
    const storageEstimate = calculateStorageUsage();
    const maxStorage = 5 * 1024 * 1024; // 5MB limit

    const processFile = async (file: File): Promise<string | null> => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return null;
      }

      if (file.size > maxFileSize) {
        setError('Image size should be less than 500KB');
        return null;
      }

      totalSize += file.size;
      if (totalSize + storageEstimate > maxStorage) {
        setError('Storage limit reached. Please delete some images first.');
        return null;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Scale down if dimensions are too large
              const maxDimension = 1200;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = (height / width) * maxDimension;
                  width = maxDimension;
                } else {
                  width = (width / height) * maxDimension;
                  height = maxDimension;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              // Convert to WebP for better compression
              const compressedImage = canvas.toDataURL('image/webp', 0.7);
              resolve(compressedImage);
            };
            img.src = e.target.result as string;
          } else {
            resolve(null);
          }
        };
        reader.readAsDataURL(file);
      });
    };

    const processedImages = await Promise.all(
      Array.from(files).map(processFile)
    );

    const validImages = processedImages.filter((img): img is string => img !== null);
    if (validImages.length > 0) {
      onAddImages(validImages);
      setError(null);
    }
  };

  const calculateStorageUsage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    return total;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div 
      className="space-y-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-2 rounded">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Screenshot ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer"
              onClick={() => {
                setCurrentImageIndex(index);
                setShowFullscreen(true);
              }}
            />
            <button
              onClick={() => {
                onRemoveImage(index);
                setError(null);
              }}
              className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <label 
          className={`w-24 h-24 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-blue-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />
          <Upload className={isDragging ? 'text-blue-400' : 'text-gray-400'} />
        </label>
      </div>

      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 p-2 text-white hover:text-gray-300"
          >
            <ChevronLeft size={24} />
          </button>
          
          <img
            src={images[currentImageIndex]}
            alt={`Screenshot ${currentImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button
            onClick={nextImage}
            className="absolute right-4 p-2 text-white hover:text-gray-300"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}