'use client';

import { useEffect } from 'react';

export default function AOSInit() {
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.default.init({
        duration: 650,
        easing: 'ease-out-cubic',
        once: true,
        offset: 30,
      });
    });
  }, []);
  return null;
}
