// Enable immersive mode for Android
export const enableImmersiveMode = () => {
  if (typeof window !== 'undefined' && (window as any).Android) {
    try {
      // Call Android immersive mode
      (window as any).Android.enableImmersiveMode();
    } catch (error) {
      console.log('Immersive mode not available:', error);
    }
  }
  
  // Also try to hide the address bar on mobile browsers
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 1);
    
    // Set viewport meta tag for fullscreen
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  }
};