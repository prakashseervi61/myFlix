/**
 * Global scroll lock utility using ref counting to support nested locks.
 * Preserves scroll position and prevents layout shift by compensating for scrollbar width.
 */
let lockCount = 0;
let originalBodyStyle = '';
let scrollY = 0;

export const scrollLock = {
  /**
   * Locks body scroll. Safe to call multiple times (ref counted).
   * Compensates for scrollbar width to prevent layout shift.
   */
  lock() {
    if (lockCount === 0) {
      originalBodyStyle = document.body.style.cssText;
      scrollY = window.scrollY;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }
    lockCount++;
  },

  /**
   * Unlocks body scroll when all locks are released.
   * Restores scroll position without smooth scrolling to avoid visual jump.
   */
  unlock() {
    lockCount--;
    if (lockCount === 0) {
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      
      document.documentElement.style.scrollBehavior = 'auto';
      
      document.body.style.cssText = originalBodyStyle;

      window.scrollTo(0, scrollY);

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
      });
    }
  }
};
