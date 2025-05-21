
import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointSizes: Record<Breakpoint, number> = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setWidth(windowWidth);
      
      // Find the largest breakpoint that the window width is greater than
      const breakpoint = (Object.keys(breakpointSizes) as Breakpoint[]).reverse()
        .find(key => windowWidth >= breakpointSizes[key]) || 'xs';
        
      setCurrentBreakpoint(breakpoint);
    };

    // Set initial values
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAbove = (breakpoint: Breakpoint) => {
    return width >= breakpointSizes[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    return width < breakpointSizes[breakpoint];
  };

  return {
    currentBreakpoint,
    width,
    isAbove,
    isBelow,
  };
};

export default useBreakpoint;
