import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImagePopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ImagePopupModal: React.FC<ImagePopupModalProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-gym-darker">
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePopupModal;