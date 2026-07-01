import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/gdft/components/ui/button";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";

const SCROLL_CONTAINER_ID = "gdft-main-scroll";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { showScrollToTopButton } = useSettings();

  const getContainer = useCallback((): HTMLElement | null => {
    return document.getElementById(SCROLL_CONTAINER_ID);
  }, []);

  // Listen to the actual scrolling container
  useEffect(() => {
    const container = getContainer();
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > 200);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Run once immediately in case already scrolled
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [getContainer]);

  const scrollToTop = () => {
    const container = getContainer();
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!showScrollToTopButton || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[9999]">
      <Button
        onClick={scrollToTop}
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center p-0 transition-opacity animate-in fade-in cursor-pointer"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6 pointer-events-none" />
      </Button>
    </div>
  );
};

export default ScrollToTopButton;
