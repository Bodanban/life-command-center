'use client';

import { useEffect, useState, useCallback } from 'react';
import WidgetPanel from '@/components/layout/WidgetPanel';
import { quotes } from '@/lib/data/quotes';

export default function QuoteWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showAuthor, setShowAuthor] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const quote = quotes[currentIndex];

  const nextQuote = useCallback(() => {
    setIsTyping(true);
    setShowAuthor(false);
    setDisplayedText('');
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    let charIndex = 0;
    const text = quote.text;

    const interval = setInterval(() => {
      if (charIndex <= text.length) {
        setDisplayedText(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowAuthor(true), 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [quote.text, isTyping]);

  // Auto-rotate every 60 seconds
  useEffect(() => {
    const timeout = setTimeout(nextQuote, 60000);
    return () => clearTimeout(timeout);
  }, [currentIndex, nextQuote]);

  return (
    <WidgetPanel accent="purple" title="Citation" icon="✦" className="h-full">
      <div
        className="flex flex-col justify-center h-full cursor-pointer"
        onClick={nextQuote}
      >
        {/* Decorative quote mark */}
        <div className="relative">
          <span className="absolute -top-4 -left-2 font-display text-5xl text-cyber-purple/10 select-none">
            &ldquo;
          </span>
          <p className="font-mono text-sm text-cyber-text leading-relaxed pl-4 min-h-[3rem]">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 bg-cyber-purple ml-0.5 animate-pulse" />
            )}
          </p>
        </div>

        {/* Author */}
        <div
          className={`mt-3 pl-4 transition-all duration-500 ${
            showAuthor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-cyber-purple text-glow-purple">
            — {quote.author}
          </p>
        </div>
      </div>
    </WidgetPanel>
  );
}
