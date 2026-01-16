import { useEffect, useRef } from 'react';

/**
 * Intersection Observer hook for infinite scroll and lazy loading.
 * @param {Object} options
 * @param {Function} options.onIntersect - Callback when target enters viewport
 * @param {boolean} options.enabled - Whether observer is active
 * @param {string} options.rootMargin - Margin around viewport (e.g., '200px' for preload)
 * @param {number} options.threshold - Visibility threshold (0.0 to 1.0)
 * @returns {React.RefObject} Ref to attach to sentinel element
 */
export function useIntersectionObserver({
  onIntersect,
  enabled = true,
  rootMargin = '200px',
  threshold = 0.0
}) {
  const targetRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      { rootMargin, threshold }
    );

    const el = targetRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [enabled, onIntersect, rootMargin, threshold]);

  return targetRef;
}
