import { useLayoutEffect } from 'react';
import { scrollLock } from '../utils/scrollLock.js';

/**
 * Hook that locks/unlocks global scroll based on boolean flag.
 * Uses layoutEffect to prevent flash of scrollable content.
 * @param {boolean} isLocked - Whether scroll should be locked
 */
export function useGlobalScrollLock(isLocked) {
  useLayoutEffect(() => {
    if (isLocked) {
      scrollLock.lock();
    }
    
    return () => {
      if (isLocked) {
        scrollLock.unlock();
      }
    };
  }, [isLocked]);
}
