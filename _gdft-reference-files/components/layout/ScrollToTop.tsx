
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that the page scrolls to the top
 * whenever the route changes. This is important for smooth navigation
 * in a Single Page Application.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the very top of the window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use 'instant' for immediate snap to top
    });

    // Also try to scroll any scrollable elements that might be causing layout issues
    // though usually window.scrollTo(0,0) is enough for most standard layouts.
    document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
    
    document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
