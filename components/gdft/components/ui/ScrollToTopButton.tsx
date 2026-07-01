import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/gdft/components/ui/button";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";

const SCROLL_CONTAINER_ID = "gdft-main-scroll";
const DRAG_THRESHOLD = 6; // pixels before it's considered a drag

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { showScrollToTopButton } = useSettings();

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const getContainer = useCallback((): HTMLElement | null => {
    return document.getElementById(SCROLL_CONTAINER_ID);
  }, []);

  // Listen to the actual scrolling container for show/hide
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > 200);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [getContainer]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
    // Do NOT call e.preventDefault() — that would swallow the click on mobile
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      hasMoved.current = true;
    }

    setPosition({
      x: posStart.current.x + dx,
      y: posStart.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;

    // Only scroll if it was a tap, not a drag
    if (!hasMoved.current) {
      const container = getContainer();
      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;
  };

  if (!showScrollToTopButton || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-24 right-4 z-[9999]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <Button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center p-0 cursor-grab active:cursor-grabbing"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6 pointer-events-none" />
      </Button>
    </div>
  );
};

export default ScrollToTopButton;
