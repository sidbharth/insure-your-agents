/**
 * Small shared helpers used across components.
 */
import { formatClockTime, formatRate } from '../lib/money';
import { useStore } from '../store';

/** Inline light-background rate text: "1 N = $3.00 · live · 14:31:07". */
export function PriceChipInline() {
  const feed = useStore((s) => s.priceFeed);
  const mode = feed.pinned ? 'pinned' : feed.stale ? 'stale' : 'live';
  return (
    <span className="num" data-testid="price-inline">
      {formatRate(feed.usdPerN)} · {mode} · {formatClockTime(feed.fetchedAt)}
    </span>
  );
}
