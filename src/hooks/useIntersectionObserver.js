import { useEffect, useRef } from 'react';

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
