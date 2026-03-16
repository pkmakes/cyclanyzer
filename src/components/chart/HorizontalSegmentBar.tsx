import { useEffect, useRef } from 'react';
import type { CycleSegment } from '../../types/domain';
import { UNASSIGNED_COLOR } from '../../types/domain';
import { now } from '../../utils/time';

type HorizontalSegmentBarProps = {
  provisionalSegments: CycleSegment[];
  startedAt: number | undefined;
  lastMarkAt: number | undefined;
  isRunning: boolean;
  /** Color for the live (in-progress) segment */
  liveColor?: string;
};

export function HorizontalSegmentBar({
  provisionalSegments,
  startedAt,
  lastMarkAt,
  isRunning,
  liveColor = UNASSIGNED_COLOR,
}: HorizontalSegmentBarProps) {
  const liveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning || !startedAt || !lastMarkAt) return;

    let raf: number;
    function tick() {
      if (!liveRef.current || !containerRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = now();
      const totalElapsed = t - startedAt!;
      if (totalElapsed <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const liveDuration = t - lastMarkAt!;
      const livePercent = (liveDuration / totalElapsed) * 100;
      liveRef.current.style.width = `${livePercent}%`;

      for (const child of Array.from(containerRef.current.children)) {
        const el = child as HTMLElement;
        const durationMs = Number(el.dataset.durationMs);
        if (!isNaN(durationMs) && !el.dataset.live) {
          el.style.width = `${(durationMs / totalElapsed) * 100}%`;
        }
      }

      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isRunning, startedAt, lastMarkAt, provisionalSegments.length]);

  if (!isRunning || !startedAt) {
    return <div className="segment-bar segment-bar--empty" />;
  }

  return (
    <div className="segment-bar" ref={containerRef}>
      {provisionalSegments.map((seg) => (
        <div
          key={seg.id}
          className="segment-bar__segment"
          data-duration-ms={seg.durationMs}
          style={{ backgroundColor: seg.color ?? UNASSIGNED_COLOR }}
        />
      ))}
      <div
        ref={liveRef}
        className="segment-bar__segment segment-bar__segment--live"
        data-live="true"
        style={{ backgroundColor: liveColor }}
      />
    </div>
  );
}
