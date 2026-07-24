/**
 * App shell (WP-0 owned): router + layout (header nav, ShowMathToggle,
 * PriceChip, UnverifiedBanner slot) + the presenter chord listener
 * (Shift+D ×3 within ~1.5 s) and the ?presenter=1 URL flag. Routes are
 * registered up front against placeholder screens; screen WPs replace only
 * their own screens/* files (plan §10 single-file ownership).
 */
import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom';
import { PriceChip } from './components/PriceChip';
import { ShowMathToggle } from './components/ShowMathToggle';
import { UnverifiedBanner } from './components/UnverifiedBanner';
import { DEMO_SMALL_PRINT, RESET_FOOTNOTE } from './data/copy';
import { useStore } from './store';
import Claim from './screens/Claim';
import ConnectAgent from './screens/ConnectAgent';
import Controls from './screens/Controls';
import Coverage from './screens/Coverage';
import Fleet from './screens/Fleet';
import GetStarted from './screens/GetStarted';
import Mandate from './screens/Mandate';
import Pay from './screens/Pay';
import Policies from './screens/Policies';
import PresenterPanel from './screens/PresenterPanel';
import Quote from './screens/Quote';
import VerifyCompany from './screens/VerifyCompany';

/** Chord window: three Shift+D presses within ~1.5 s toggle the panel. */
const CHORD_WINDOW_MS = 1500;
const CHORD_COUNT = 3;

function PresenterChordListener() {
  const presses = useRef<number[]>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || (e.key !== 'D' && e.key !== 'd')) return;
      const now = performance.now();
      presses.current = presses.current
        .filter((t) => now - t < CHORD_WINDOW_MS)
        .concat(now);
      if (presses.current.length >= CHORD_COUNT) {
        presses.current = [];
        const s = useStore.getState();
        s.setPanelOpen(!s.presenter.panelOpen);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}

/** ?presenter=1 opens the panel — the URL flag alternative to the chord. */
function PresenterUrlFlag() {
  const [params] = useSearchParams();
  const flag = params.get('presenter');
  useEffect(() => {
    if (flag === '1') useStore.getState().setPanelOpen(true);
  }, [flag]);
  return null;
}

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/policies', label: 'My policies' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/coverage', label: 'Coverage' },
  { to: '/claim', label: 'Claims' },
];

function Header() {
  const operatorName = useStore((s) => s.operator.name);
  const initials = operatorName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-[54px] items-center gap-6 bg-ink px-7 text-white">
      <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-bold">
          IA
        </span>
        Insure Your Agents
        <span className="rounded border border-white/25 px-1.5 py-px text-[10px] font-bold tracking-widest text-[#9db1cc]">
          DEMO
        </span>
      </Link>
      <nav className="flex gap-0.5 text-sm" data-testid="main-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 ${
                isActive ? 'bg-[#1b2a44] font-semibold text-white' : 'text-[#a9b7cb]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <ShowMathToggle />
        <span className="h-[22px] w-px bg-white/15" />
        <PriceChip />
        <span
          title={operatorName}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#2c4468] text-[10px] font-bold text-[#bcd0ec]"
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-shell px-6 pb-8 pt-10 text-2xs text-faint">
      <p>{DEMO_SMALL_PRINT}</p>
      <p className="mt-1">{RESET_FOOTNOTE}</p>
    </footer>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PresenterChordListener />
      <PresenterUrlFlag />
      <Header />
      <UnverifiedBanner />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<GetStarted />} />
          <Route path="/verify" element={<VerifyCompany />} />
          <Route path="/connect" element={<ConnectAgent />} />
          <Route path="/mandate" element={<Mandate />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/claim/:claimId" element={<Claim />} />
        </Routes>
      </main>
      <Footer />
      <PresenterPanel />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
