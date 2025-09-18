import { useState, useEffect } from 'react';

// These are standard TailwindCSS breakpoint values
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * A custom React hook to track the current responsive breakpoint.
 * This allows components to easily adapt their layout for different screen sizes.
 * @returns An object with boolean flags like `isMobile`, `isTablet`, `isDesktop`.
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<string>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.md) {
        setBreakpoint('sm'); // Mobile
      } else if (width >= breakpoints.md && width < breakpoints.lg) {
        setBreakpoint('md'); // Tablet
      } else {
        setBreakpoint('lg'); // Desktop
      }
    };

    // Set the initial breakpoint
    handleResize();

    // Add event listener to update on window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg',
  };
};