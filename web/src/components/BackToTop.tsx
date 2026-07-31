'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Show once half of the first screen has scrolled past — early
      // enough to feel responsive, late enough to avoid flashing on
      // tiny scrolls. Viewport-relative, consistent on any display.
      setVisible(window.scrollY > window.innerHeight * 0.5);
      setProgress(maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.button
            key="back-to-top"
            type="button"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            whileTap={{ scale: 0.88 }}
            onClick={scrollToTop}
            className="fixed right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] shadow-[var(--shadow-card-hover)] sm:right-6"
            style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            aria-label="Back to top"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle
                cx="24"
                cy="24"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--on-accent)"
                strokeOpacity="0.35"
                strokeWidth="2.5"
              />
              <circle
                cx="24"
                cy="24"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--on-accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              />
            </svg>
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
