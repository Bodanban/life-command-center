'use client';

import { useEffect, useState } from 'react';

export default function ScreenDimmer() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const updateDimmer = () => {
      const hour = new Date().getHours();

      if (hour >= 7 && hour < 22) {
        setOpacity(0);
      } else if (hour >= 22 && hour < 23) {
        setOpacity(0.2);
      } else if (hour >= 23 || hour < 5) {
        setOpacity(0.45);
      } else if (hour >= 5 && hour < 6) {
        setOpacity(0.2);
      } else {
        setOpacity(0.1);
      }
    };

    updateDimmer();
    const interval = setInterval(updateDimmer, 60000);

    return () => clearInterval(interval);
  }, []);

  if (opacity === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black pointer-events-none z-[9998]"
      style={{
        opacity,
        transition: 'opacity 5s ease-in-out',
      }}
    />
  );
}
