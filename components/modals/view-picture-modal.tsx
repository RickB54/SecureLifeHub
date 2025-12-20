"use client"

import { X, Download } from "lucide-react"

interface ViewPictureModalProps {
  onClose: () => void
  picture: string
  passwordName: string
  theme: string
}

export default function ViewPictureModal({ onClose, picture, passwordName, theme }: ViewPictureModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = picture
    link.download = `${passwordName || "password"}-picture.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log("Picture downloaded")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Password Picture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-center">
            <img src={picture || "/placeholder.svg"} alt="Password" className="max-h-96 object-contain rounded-md" />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-md transition duration-200"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

