import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/gdft/components/ui/button";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { showScrollToTopButton } = useSettings();
  
  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Show button when page is scrolled down
  const toggleVisibility = (e: any) => {
    const target = e.target as HTMLElement;
    if (target && target.scrollTop !== undefined) {
      if (target.scrollTop > 300) {
        setIsVisible(true);
        return;
      }
    }
    
    if (window.scrollY > 300) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    buttonPos.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.current = true;
    }
    setPosition({
      x: buttonPos.current.x + dx,
      y: buttonPos.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (!hasMoved.current) {
      // Trigger scroll
      window.scrollTo({ top: 0, behavior: "smooth" });
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Also try to scroll document element just in case
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility, true);
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility, true);
    };
  }, []);

  if (!isVisible || !showScrollToTopButton) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-24 right-4 z-[100]"
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, touchAction: 'none' }}
    >
      <Button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center p-0 transition-opacity animate-in fade-in cursor-grab active:cursor-grabbing"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6 pointer-events-none" />
      </Button>
    </div>
  );
};

export default ScrollToTopButton;
