import { useEffect, useRef } from 'react';

/** Adds the `reveal-visible` class (see index.css `.reveal`) the first time
 *  the element scrolls into view, for a classic fade-in-up landing page feel. */
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
