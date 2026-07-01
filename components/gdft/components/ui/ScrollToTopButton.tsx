import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/gdft/components/ui/button";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    // Check window scroll
    if (window.scrollY > 300) {
      setIsVisible(true);
      return;
    }

    // Check main scroll container in GdftShell
    const mainContainer = document.querySelector('main');
    if (mainContainer && mainContainer.scrollTop > 300) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    // Scroll window
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Scroll main container
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    
    // Also listen to the main container's scroll event since GdftShell uses overflow-y-auto on main
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.addEventListener("scroll", toggleVisibility);
    }

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (mainContainer) {
        mainContainer.removeEventListener("scroll", toggleVisibility);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[100]">
      <Button
        onClick={scrollToTop}
        className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-white flex items-center justify-center p-0 transition-all animate-in fade-in slide-in-from-bottom-5"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ScrollToTopButton;
