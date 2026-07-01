import React, { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/gdft/components/ui/button";
import { useSettings } from "@/components/gdft/contexts/SettingsContext";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { showScrollToTopButton } = useSettings();
  
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

  const scrollToTop = () => {
    // Scroll window
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Scroll main container
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    <div className="fixed bottom-24 right-4 z-[100]">
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
