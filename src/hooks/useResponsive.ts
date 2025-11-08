import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 480;

/**
 * Custom hook to detect mobile vs desktop viewport
 * @param breakpoint - Pixel width to consider as mobile (default: 480px)
 * @returns Object with isMobile flag and current width
 */
export const useResponsive = (breakpoint: number = MOBILE_BREAKPOINT) => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= breakpoint;

  return {
    isMobile,
    isDesktop: !isMobile,
    windowWidth,
    breakpoint,
  };
};
