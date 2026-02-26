'use client';

import { useEffect } from 'react';

export default function AOSInit() {
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.default.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 40,
        delay: 0,
      });
      // Re-scan after full page load (catches lazy-rendered elements)
      window.addEventListener('load', () => AOS.default.refresh(), { once: true });
    });
  }, []);
  return null;
}
