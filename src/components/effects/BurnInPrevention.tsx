'use client';

import { useEffect, useState } from 'react';

interface BurnInPreventionProps {
  children: React.ReactNode;
}

export default function BurnInPrevention({ children }: BurnInPreventionProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset({
        x: Math.round((Math.random() - 0.5) * 4),
        y: Math.round((Math.random() - 0.5) * 4),
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 2s ease-in-out',
      }}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}
