import { useEffect, useRef } from 'react';
import { formatMs, now } from '../../utils/time';

type TimerDisplayProps = {
  startedAt: number | undefined;
  className?: string;
};

/**
 * Self-contained timer display that updates via requestAnimationFrame
 * and direct DOM manipulation, avoiding React re-renders that break
 * touch events on iOS WebKit.
 */
export function TimerDisplay({ startedAt, className = 'timer-display' }: TimerDisplayProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (startedAt === undefined) {
      if (ref.current) ref.current.textContent = formatMs(0, 1);
      return;
    }

    let raf: number;
    function tick() {
      if (ref.current) {
        ref.current.textContent = formatMs(now() - startedAt!, 1);
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);

  return <span ref={ref} className={className}>{formatMs(0, 1)}</span>;
}
