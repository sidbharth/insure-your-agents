/**
 * Persistent price chip (plan §1, GT-9, AC-15):
 * "1 N = $3.02 · CoinGecko · live · 14:31:07", or "stale", or "pinned $3.00".
 * Lives in the header; every N display traces to this rate/source/timestamp.
 */
import { formatClockTime, formatRate } from '../lib/money';
import { useStore } from '../store';
import { priceFeedMode } from './helpers';

export interface PriceChipProps {
  className?: string;
}

export function PriceChip({ className = '' }: PriceChipProps) {
  const feed = useStore((s) => s.priceFeed);

  const mode = priceFeedMode(feed);
  const dotClass =
    mode === 'live'
      ? 'bg-[#35c56d] shadow-[0_0_0_3px_rgba(53,197,109,.18)]'
      : mode === 'stale'
        ? 'bg-[#e8a13c] shadow-[0_0_0_3px_rgba(232,161,60,.18)]'
        : 'bg-[#9db1cc] shadow-[0_0_0_3px_rgba(157,177,204,.18)]';

  return (
    <span
      data-testid="price-chip"
      data-mode={mode}
      className={`num inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-[#dfe7f1] ${className}`}
    >
      <span className={`h-[7px] w-[7px] flex-none rounded-full ${dotClass}`} />
      <b className="font-semibold text-white">{formatRate(feed.usdPerN)}</b>
      <span className="text-[#93a5bc]">
        {feed.source === 'CoinGecko' ? 'CoinGecko' : 'seed'} · {mode} ·{' '}
        {formatClockTime(feed.fetchedAt)}
      </span>
      {mode === 'stale' && (
        <span className="rounded-sm bg-[#e8a13c] px-1 py-px text-[9px] font-extrabold tracking-widest text-[#3c2b06]">
          PRICE STALE
        </span>
      )}
      {mode === 'pinned' && (
        <span className="rounded-sm bg-[#9db1cc] px-1 py-px text-[9px] font-extrabold tracking-widest text-ink">
          PINNED
        </span>
      )}
    </span>
  );
}
