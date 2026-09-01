import { type ChangeEvent, type DragEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  GripVertical,
  Gauge,
  Globe2,
  ImagePlus,
  IndianRupee,
  Layers3,
  LockKeyhole,
  Network,
  Pin,
  Plus,
  Radar,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type PersonaId = 'keeper' | 'builder' | 'conviction' | 'income' | 'mandate';
type Stance = 'support' | 'hold' | 'reduce';
type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD';

type InvestorProfile = {
  name: string;
  ageBand: string;
  surplus: string;
  experience: string;
  holdings: string[];
  horizon: string;
  objective: string;
  risk: number;
};

type VisionGoal = {
  id: string;
  title: string;
  caption: string;
  image: string;
  amount: string;
  timeframe: string;
  custom?: boolean;
};

const currencyOptions: { code: CurrencyCode; label: string; symbol: string; rate: number }[] = [
  { code: 'INR', label: 'Indian rupee', symbol: '₹', rate: 1 },
  { code: 'USD', label: 'US dollar', symbol: '$', rate: 0.012 },
  { code: 'EUR', label: 'Euro', symbol: '€', rate: 0.011 },
  { code: 'GBP', label: 'Pound sterling', symbol: '£', rate: 0.0094 },
  { code: 'SGD', label: 'Singapore dollar', symbol: 'S$', rate: 0.016 },
];

const goalOptions: VisionGoal[] = [
  { id: 'home', title: 'First home', caption: 'A place that is yours', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85', amount: '₹50L – ₹1Cr', timeframe: '5–10 years' },
  { id: 'retirement', title: 'Retirement', caption: 'Freedom on your terms', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85', amount: '₹1Cr – ₹3Cr', timeframe: '15–25 years' },
  { id: 'education', title: 'Child’s education', caption: 'Keep doors open', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=85', amount: '₹25L – ₹50L', timeframe: '10–15 years' },
  { id: 'venture', title: 'Startup capital', caption: 'Back your next chapter', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85', amount: '₹10L – ₹25L', timeframe: '3–5 years' },
  { id: 'travel', title: 'World travel', caption: 'Collect the long way around', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85', amount: '₹5L – ₹10L', timeframe: '1–3 years' },
  { id: 'emergency', title: 'Emergency fund', caption: 'A quieter kind of wealth', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85', amount: '₹5L – ₹10L', timeframe: '1–3 years' },
  { id: 'wealth', title: 'Wealth growth', caption: 'Compound with intention', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=85', amount: '₹50L – ₹1Cr', timeframe: '10+ years' },
];

const defaultProfile: InvestorProfile = {
  name: 'Alex Rivera',
  ageBand: '31–40',
  surplus: '₹50k – ₹1L / month',
  experience: 'Intermediate',
  holdings: ['Equity', 'Mutual funds'],
  horizon: '5–10 years',
  objective: 'Grow wealth',
  risk: 57,
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'FI';
}

function formatMoney(valueInr: number, currency: CurrencyCode) {
  const option = currencyOptions.find((item) => item.code === currency) ?? currencyOptions[0];
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 0,
    notation: valueInr * option.rate >= 1000000 ? 'compact' : 'standard',
  }).format(valueInr * option.rate);
}

type Persona = {
  id: PersonaId;
  name: string;
  short: string;
  description: string;
  priority: string;
  tone: string;
};

type Signal = {
  id: string;
  ticker: string;
  name: string;
  headline: string;
  detail: string;
  change: string;
  time: string;
};

type Opinion = {
  stance: Stance;
  rationale: string;
  confidence: number;
  bars: number[];
};

const personas: Persona[] = [
  {
    id: 'keeper',
    name: 'Novice',
    short: 'Protect first',
    description: 'Preserves optionality and treats drawdowns as permanent until proven otherwise.',
    priority: 'Downside containment',
    tone: 'cautious',
  },
  {
    id: 'builder',
    name: 'Growth',
    short: 'Compound steadily',
    description: 'Prefers durable cash flows, incremental entries, and evidence over urgency.',
    priority: 'Quality at a fair price',
    tone: 'measured',
  },
  {
    id: 'conviction',
    name: 'Aggressive',
    short: 'Follow the signal',
    description: 'Accepts volatility when a catalyst changes the long-term earnings path.',
    priority: 'Asymmetric upside',
    tone: 'decisive',
  },
  {
    id: 'income',
    name: 'Advanced',
    short: 'Fund the future',
    description: 'Values reliable distributions and protects the portfolio’s spending rhythm.',
    priority: 'Cash-flow durability',
    tone: 'pragmatic',
  },
  {
    id: 'mandate',
    name: 'Preservation',
    short: 'Invest with intent',
    description: 'Balances return with an explicit mandate, governance, and transition risk.',
    priority: 'Real-world alignment',
    tone: 'deliberate',
  },
];

const signals: Signal[] = [
  {
    id: 'nvda',
    ticker: 'NVDA',
    name: 'NVIDIA CORP.',
    headline: 'Export controls widen to next-gen accelerators',
    detail: 'Commerce Department filing · 18 min ago',
    change: '-4.8%',
    time: '09:42 ET',
  },
  {
    id: 'enph',
    ticker: 'ENPH',
    name: 'ENPHASE ENERGY',
    headline: 'Grid-scale storage guidance revised lower',
    detail: 'Earnings call transcript · 1h ago',
    change: '-9.2%',
    time: '08:58 ET',
  },
  {
    id: 'lly',
    ticker: 'LLY',
    name: 'ELI LILLY & CO.',
    headline: 'Payer mix shifts as access expands',
    detail: '10-Q filing · 3h ago',
    change: '+2.1%',
    time: '07:14 ET',
  },
];

const agentNames = [
  'Fundamentals',
  'Valuation',
  'Macro',
  'Risk',
  'Sentiment',
  'Filings',
  'Portfolio fit',
  'Contrarian',
];

const baseRationales = [
  'Revenue concentration makes near-term visibility fragile, but the platform remains difficult to replace.',
  'The drawdown is meaningful, though forward estimates have not fully reset around the new constraint.',
  'Policy is now a first-order variable; secondary demand and allied capacity matter more than headlines.',
  'Position sizing is the cleanest control while the scope and duration of the restriction settle.',
  'The tape is pricing a clean break. That can create entry value, but confirmation will be noisy.',
  'The cited notice is primary, while supplier exposure and management response are still unfiled.',
  'Existing semiconductor exposure raises correlation risk even if the individual thesis survives.',
  'Consensus is too binary: both the bull case and the bear case assume a fast demand response.',
];

const personaStances: Record<PersonaId, Stance[]> = {
  keeper: ['reduce', 'reduce', 'hold', 'reduce', 'hold', 'hold', 'reduce', 'hold'],
  builder: ['hold', 'hold', 'hold', 'hold', 'hold', 'support', 'hold', 'support'],
  conviction: ['support', 'support', 'hold', 'hold', 'support', 'support', 'support', 'support'],
  income: ['reduce', 'reduce', 'hold', 'reduce', 'reduce', 'hold', 'hold', 'hold'],
  mandate: ['hold', 'hold', 'support', 'hold', 'hold', 'support', 'support', 'support'],
};

const personaOffsets: Record<PersonaId, number[]> = {
  keeper: [-13, -8, -4, 5, -6, 2, -11, -1],
  builder: [2, 4, 1, 2, 3, 8, 0, 7],
  conviction: [10, 14, 4, 7, 12, 10, 11, 13],
  income: [-10, -5, -2, -4, -8, 1, 3, 0],
  mandate: [3, 5, 8, 4, 1, 9, 10, 8],
};

const stanceLabel: Record<Stance, string> = {
  support: 'support',
  hold: 'hold',
  reduce: 'reduce',
};

function getPersona(id: PersonaId) {
  return personas.find((persona) => persona.id === id) ?? personas[1];
}

function getOpinions(personaId: PersonaId): Opinion[] {
  return baseRationales.map((rationale, index) => {
    const confidence = Math.min(94, Math.max(51, 72 + personaOffsets[personaId][index]));
    const stance = personaStances[personaId][index];
    return {
      stance,
      confidence,
      rationale,
      bars: [34 + index * 4, confidence - 18, 46 + (index % 3) * 15, confidence - 7, 40 + (index % 4) * 10],
    };
  });
}

type LogEntry = { time: string; event: string; detail: string };

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function FinancialAtmosphere() {
  return (
    <div className="market-atmosphere" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="none">
        <path className="atmosphere-grid" d="M0 168H1600 M0 340H1600 M0 512H1600 M0 684H1600" />
        <path className="atmosphere-line" d="M-30 640 C150 560 205 702 354 584 S580 392 734 486 S964 675 1112 490 S1358 290 1630 390" />
        <path className="atmosphere-line secondary" d="M-30 306 C128 236 244 318 386 278 S626 168 788 292 S1010 458 1182 334 S1392 184 1630 235" />
        <path className="atmosphere-line tertiary" d="M-30 775 C176 698 302 790 470 714 S710 610 900 706 S1168 800 1320 658 S1485 560 1630 610" />
      </svg>
      <span className="atmosphere-particle one" />
      <span className="atmosphere-particle two" />
      <span className="atmosphere-particle three" />
      <span className="atmosphere-particle four" />
      <span className="atmosphere-particle five" />
      <span className="atmosphere-note one" />
      <span className="atmosphere-note two" />
      <span className="atmosphere-note three" />
      <span className="currency-glyph one">₹</span>
      <span className="currency-glyph two">$</span>
      <span className="currency-glyph three">€</span>
      <span className="currency-glyph four">£</span>
    </div>
  );
}

function Shell({
  children,
  personaId,
  profile,
  currency,
  onCurrencyChange,
  perfOpen,
  setPerfOpen,
  logs,
  onLog,
}: {
  children: ReactNode;
  personaId: PersonaId;
  profile: InvestorProfile;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  perfOpen: boolean;
  setPerfOpen: (open: boolean) => void;
  logs: LogEntry[];
  onLog: (event: string, detail: string) => void;
}) {
  const [location] = useLocation();
  const persona = getPersona(personaId);
  const navItems = [
    { href: '/', label: 'Command center', icon: Gauge, test: 'link-dashboard' },
    { href: '/judge', label: 'Judge panel', icon: Network, test: 'link-judge' },
    { href: '/onboarding', label: 'Investor profile', icon: SlidersHorizontal, test: 'link-profile' },
  ];

  return (
    <div className="app-shell">
      <aside className="side-rail" data-testid="navigation-sidebar">
        <Link href="/" className="brand-lockup" data-testid="link-brand">
          <span className="brand-seal">F</span>
          <span className="brand-name">FINORA</span>
        </Link>
        <div className="rail-rule" />
        <span className="nav-caption">Workspace</span>
        <nav className="nav-stack" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${active ? ' active' : ''}`}
                data-testid={item.test}
                onClick={() => onLog('navigation', `Opened ${item.label}`)}
              >
                <Icon size={15} strokeWidth={1.7} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rail-footer">
          <div className="profile-chip" data-testid="text-active-persona">
            <span className="avatar">{initials(profile.name)}</span>
            <span className="profile-meta">
              <span>{profile.name}</span>
              <small>{persona.name}</small>
            </span>
          </div>
          <div className="live-mark" style={{ marginTop: 17 }}>
            <span className="live-dot" />
            Local simulation
          </div>
        </div>
      </aside>
      <main className="main-canvas">
        <header className="topbar">
          <div className="topbar-context">
            <span className="live-mark"><span className="live-dot" />Market session</span>
            <span style={{ color: '#7b694e' }}>/</span>
            <strong>{location === '/judge' ? 'Decision review' : 'Morning brief'}</strong>
          </div>
          <div className="topbar-actions">
            <label className="currency-control" title="Display currency">
              <Globe2 size={13} strokeWidth={1.7} />
              <select value={currency} aria-label="Display currency" data-testid="select-currency" onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}>
                {currencyOptions.map((option) => <option key={option.code} value={option.code}>{option.code} · {option.symbol}</option>)}
              </select>
            </label>
            <button className="icon-button" type="button" data-testid="button-notifications" aria-label="View notifications" onClick={() => onLog('notifications', 'No unread alerts')}>
              <Bell size={15} strokeWidth={1.7} />
            </button>
            <button className="button-quiet" type="button" data-testid="button-performance" onClick={() => setPerfOpen(!perfOpen)}>
              <Activity size={14} strokeWidth={1.7} />
              {perfOpen ? 'Close log' : 'Performance log'}
            </button>
          </div>
        </header>
        {children}
        {perfOpen && (
          <section className="log-drawer" aria-label="Performance log" data-testid="panel-performance-log">
            <div className="panel-header" style={{ marginBottom: 8 }}>
              <div>
                <h3>Client performance log</h3>
                <div className="panel-subtitle" style={{ marginLeft: 0 }}>Local trace for this session</div>
              </div>
              <button className="icon-button" type="button" data-testid="button-close-performance" aria-label="Close performance log" onClick={() => setPerfOpen(false)}>
                <X size={14} />
              </button>
            </div>
            {logs.slice(-5).reverse().map((log, index) => (
              <div className="log-entry" key={`${log.time}-${index}`} data-testid={`log-entry-${index}`}>
                <time>{log.time}</time>
                <div><strong>{log.event}</strong>{log.detail}</div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function DashboardPage({
  personaId,
  profile,
  currency,
  onPersonaChange,
  onOpenJudge,
  onLog,
  onToast,
}: {
  personaId: PersonaId;
  profile: InvestorProfile;
  currency: CurrencyCode;
  onPersonaChange: (id: PersonaId) => void;
  onOpenJudge: (signalId: string) => void;
  onLog: (event: string, detail: string) => void;
  onToast: (message: string) => void;
}) {
  const persona = getPersona(personaId);
  const bars = useMemo(() => persona.id === 'keeper' ? [42, 36, 49, 32, 41, 37, 52, 44, 57, 53, 61, 58] : persona.id === 'conviction' ? [36, 42, 39, 51, 47, 56, 53, 61, 57, 67, 62, 71] : [37, 42, 40, 47, 45, 49, 54, 51, 58, 56, 61, 64], [persona.id]);

  return (
    <div className="workspace" data-testid="page-dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Thursday · 14 November 2024 · 09:44 ET</div>
          <h1>Good morning, {profile.name.split(' ')[0]}.</h1>
          <p>Three market events need a second look. FINORA has separated signal from noise and queued the decisions where your lens matters most.</p>
        </div>
        <div className="heading-note">
          <strong>Signal integrity 84 / 100</strong>
          38 sources reconciled · 2 partial reads
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card dark" data-testid="metric-portfolio-value">
          <span className="metric-label">Portfolio value</span>
          <span className="metric-value">{formatMoney(20744000, currency)}</span>
          <span className="metric-detail">+{formatMoney(285100, currency)} today · +11.7% YTD</span>
        </article>
        <article className="metric-card secondary" data-testid="metric-risk-budget">
          <span className="metric-label">Risk budget used</span>
          <span className="metric-value">38.4%</span>
          <span className="metric-detail">Within your 55% ceiling</span>
        </article>
        <article className="metric-card" data-testid="metric-cash">
          <span className="metric-label">Unallocated cash</span>
          <span className="metric-value">{formatMoney(1538000, currency)}</span>
          <span className="metric-detail">7.4% of portfolio</span>
        </article>
        <article className="metric-card secondary" data-testid="metric-conviction">
          <span className="metric-label">Open decisions</span>
          <span className="metric-value">03</span>
          <span className="metric-detail negative">1 needs your review</span>
        </article>
      </div>

      <div className="dashboard-grid">
        <div>
          <section className="panel" data-testid="panel-market-signals">
            <div className="panel-header">
              <div>
                <div className="panel-title"><Radar size={16} strokeWidth={1.7} /> Market signals</div>
                <p className="panel-subtitle">Ranked by portfolio relevance, not volume.</p>
              </div>
              <button className="panel-link" type="button" data-testid="button-refresh-signals" onClick={() => onToast('Signals refreshed from the local event stream.')}>
                <RefreshCw size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />Refresh
              </button>
            </div>
            <div className="signal-list">
              {signals.map((signal, index) => (
                <button
                  className={`signal-row${index === 0 ? ' selected' : ''}`}
                  type="button"
                  key={signal.id}
                  data-testid={`button-signal-${signal.id}`}
                  onClick={() => onOpenJudge(signal.id)}
                >
                  <span className="signal-ticker">{signal.ticker}<span>{signal.time}</span></span>
                  <span className="signal-copy"><strong>{signal.headline}</strong><p>{signal.detail}</p></span>
                  <span className="signal-change">{signal.change}<small>review reasoning <ChevronRight size={11} style={{ verticalAlign: 'middle' }} /></small></span>
                </button>
              ))}
            </div>
            <div className="source-line"><Database size={13} /><span>Evidence window:</span><strong>last 24 hours</strong><span>·</span><span>citations attached</span></div>
          </section>

          <section className="panel" data-testid="panel-watchlist">
            <div className="panel-header">
              <div>
                <div className="panel-title"><BookOpen size={16} strokeWidth={1.7} /> Personal watchlist</div>
                <p className="panel-subtitle">A quiet place for questions before they become trades.</p>
              </div>
              <button className="icon-button" type="button" data-testid="button-add-watchlist" aria-label="Add watchlist item" onClick={() => onToast('Watchlist capture is ready for the next event.')}>
                <Plus size={15} />
              </button>
            </div>
            <div className="empty-state" data-testid="empty-watchlist">
              <Layers3 size={20} strokeWidth={1.4} />
              <h3>No private questions yet</h3>
              <p>Save an unresolved signal here to keep its evidence trail and revisit the decision when new filings arrive.</p>
              <button className="button-outline" type="button" data-testid="button-capture-question" onClick={() => onToast('Question capture added to your local workspace.')}>Capture a question <ArrowRight size={13} /></button>
            </div>
          </section>
        </div>

        <div>
          <section className="panel" data-testid="panel-persona">
            <div className="panel-header">
              <div>
                <div className="panel-title"><BriefcaseBusiness size={16} strokeWidth={1.7} /> Active lens</div>
                <p className="panel-subtitle">The same event. A different decision.</p>
              </div>
              <span className="eyebrow" style={{ color: '#8d3a3c' }}>live</span>
            </div>
            <div className="persona-box">
              <div className="eyebrow">Your current investor persona</div>
              <div className="persona-row">
                <div><h3>{persona.name}</h3><p>{persona.priority}</p></div>
                <ShieldCheck size={21} color="#8d3a3c" strokeWidth={1.5} />
              </div>
              <select className="persona-select" value={persona.id} data-testid="select-dashboard-persona" onChange={(event) => { onPersonaChange(event.target.value as PersonaId); onLog('persona switch', `Lens changed to ${getPersona(event.target.value as PersonaId).name}`); }}>
                {personas.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
              </select>
            </div>
          </section>

          <section className="panel" data-testid="panel-trajectory">
            <div className="panel-header">
              <div>
                <div className="panel-title"><BarChart3 size={16} strokeWidth={1.7} /> Portfolio trajectory</div>
                <p className="panel-subtitle">12-week mark · {persona.short.toLowerCase()}</p>
              </div>
              <span className="mono" style={{ fontSize: 11, color: '#8d3a3c' }}>+8.6%</span>
            </div>
            <div className="mini-chart" aria-label="Portfolio trajectory chart" data-testid="chart-trajectory">
              {bars.map((height, index) => <span className="mini-bar" key={index} style={{ height: `${height}%` }} />)}
            </div>
            <div className="allocation">
              <div className="allocation-line"><span>Equities</span><span className="allocation-track"><span className="allocation-fill" style={{ width: persona.id === 'keeper' ? '48%' : '63%' }} /></span><span>{persona.id === 'keeper' ? '48' : '63'}%</span></div>
              <div className="allocation-line"><span>Fixed income</span><span className="allocation-track"><span className="allocation-fill accent" style={{ width: persona.id === 'income' ? '34%' : '21%' }} /></span><span>{persona.id === 'income' ? '34' : '21'}%</span></div>
              <div className="allocation-line"><span>Cash / other</span><span className="allocation-track"><span className="allocation-fill" style={{ width: '16%' }} /></span><span>16%</span></div>
            </div>
          </section>

          <section className="panel" data-testid="panel-data-health">
            <div className="panel-header" style={{ marginBottom: 8 }}>
              <div className="panel-title"><CircleHelp size={16} strokeWidth={1.7} /> Data health</div>
              <span className="mono" style={{ color: '#8d3a3c', fontSize: 12 }}>84%</span>
            </div>
            <p className="panel-subtitle" style={{ marginLeft: 0 }}>Public filings are delayed for one issuer. Judge Panel will mark that synthesis partial instead of filling the gap.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function JudgePage({
  personaId,
  selectedSignalId,
  onPersonaChange,
  onLog,
  onToast,
}: {
  personaId: PersonaId;
  selectedSignalId: string;
  onPersonaChange: (id: PersonaId) => void;
  onLog: (event: string, detail: string) => void;
  onToast: (message: string) => void;
}) {
  const signal = signals.find((item) => item.id === selectedSignalId) ?? signals[0];
  const persona = getPersona(personaId);
  const opinions = useMemo(() => getOpinions(personaId), [personaId]);
  const supportCount = opinions.filter((opinion) => opinion.stance === 'support').length;
  const reduceCount = opinions.filter((opinion) => opinion.stance === 'reduce').length;
  const synthesisScore = Math.round(opinions.reduce((sum, opinion) => sum + opinion.confidence, 0) / opinions.length);
  const recommendation = supportCount >= 5 ? 'Stage an entry' : reduceCount >= 4 ? 'Trim and wait' : 'Hold, then reassess';

  return (
    <div className="workspace" data-testid="page-judge">
      <div className="judge-header">
        <Link href="/" className="back-link" data-testid="link-back-dashboard"><ArrowLeft size={13} /> Back to brief</Link>
        <div className="judge-event">
          <div className="eyebrow">Judge panel · event under review</div>
          <h1>{signal.ticker}: {signal.headline}</h1>
          <p><strong style={{ color: '#3b1319' }}>What changed:</strong> {signal.detail}. Eight specialist agents are reading the same event through your active lens. No consensus is hidden; every stance carries its rationale, confidence, and evidence boundary.</p>
        </div>
        <div className="judge-switcher">
          <label htmlFor="judge-persona">View through persona</label>
          <select id="judge-persona" className="persona-select" style={{ marginTop: 0 }} value={persona.id} data-testid="select-judge-persona" onChange={(event) => { const next = event.target.value as PersonaId; onPersonaChange(next); onLog('persona switch', `Reweighted eight agents for ${getPersona(next).name}`); }}>
            {personas.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
          </select>
        </div>
      </div>

      <div className="agent-layout">
        <section className="panel" style={{ padding: 14 }} data-testid="panel-agent-opinions">
          <div className="panel-header" style={{ padding: '5px 5px 0', marginBottom: 12 }}>
            <div>
              <div className="panel-title"><Network size={16} strokeWidth={1.7} /> Eight-agent readout</div>
              <p className="panel-subtitle">Live weighting for <strong style={{ color: '#3b1319' }}>{persona.name}</strong> · same source set</p>
            </div>
            <div className="live-mark"><span className="live-dot" />reweighted</div>
          </div>
          <div className="agent-list">
            {agentNames.map((name, index) => {
              const opinion = opinions[index];
              return (
                <article className="agent-card" key={name} style={{ animationDelay: `${index * 35}ms` }} data-testid={`card-agent-${index + 1}`}>
                  <div className="agent-top">
                    <div className="agent-name"><span className="agent-index">0{index + 1}</span>{name}</div>
                    <span className={`stance ${opinion.stance}`}>{stanceLabel[opinion.stance]}</span>
                  </div>
                  <p className="agent-rationale">{opinion.rationale}</p>
                  <div className="agent-foot">
                    <div className="confidence-track" aria-label={`${opinion.confidence}% confidence`}><div className="confidence-fill" style={{ width: `${opinion.confidence}%` }} /></div>
                    <span className="agent-confidence" data-testid={`text-confidence-${index + 1}`}>{opinion.confidence}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 19, marginTop: 10 }} aria-label="Agent confidence shape">
                    {opinion.bars.map((bar, barIndex) => <span key={barIndex} style={{ width: 5, height: `${Math.round(bar / 5)}px`, background: barIndex === 3 ? '#8d3a3c' : '#c6b39a', display: 'block' }} />)}
                    <span className="mono" style={{ color: '#7b694e', fontSize: 9, marginLeft: 5 }}>confidence shape</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="synthesis" data-testid="panel-synthesis">
          <span className="synthesis-badge"><ShieldCheck size={12} /> transparent synthesis</span>
          <h2>{recommendation}</h2>
          <p>For the <strong style={{ color: '#f1e9dc' }}>{persona.name}</strong>, the panel leans toward a paced response rather than a headline trade.</p>
          <div className="synthesis-score"><strong>{synthesisScore}</strong><span>/ 100<br />decision confidence</span></div>
          <div className="synthesis-block">
            <label>Recommended action</label>
            <strong>{recommendation} · 25% tranche</strong>
          </div>
          <div className="synthesis-block">
            <label>Data completeness</label>
            <strong style={{ color: '#e3c8b1' }}>Partial read · filing unavailable</strong>
            <p style={{ marginTop: 7 }}>Supplier exposure and management guidance have not been published. The agents flag the missing evidence instead of inferring it.</p>
          </div>
          <div className="synthesis-block">
            <label>Why this changes with your lens</label>
            <p>{persona.description} The same export notice is a sizing problem here, not a universal buy or sell command.</p>
          </div>
          <button className="synthesis-action" type="button" data-testid="button-save-decision" onClick={() => onToast(`Decision saved to local log: ${recommendation.toLowerCase()}.`)}>Save decision note <FileText size={13} style={{ verticalAlign: 'middle', marginLeft: 5 }} /></button>
          <div className="synthesis-block">
            <label>Cited evidence</label>
            <div className="source-list">
              <div className="source-item"><Check size={13} color="#c6b39a" /><div><strong>Commerce Dept. notice</strong><span>Primary · published 09:24 ET</span></div></div>
              <div className="source-item"><Check size={13} color="#c6b39a" /><div><strong>10-Q · 30 Sep 2024</strong><span>Issuer filing · revenue mix</span></div></div>
              <div className="source-item"><Clock3 size={13} color="#a88f7b" /><div><strong>Supplier exposure</strong><span>Pending · not available</span></div></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function OnboardingPage({
  initialPersona,
  initialProfile,
  initialGoals,
  onComplete,
  onLog,
}: {
  initialPersona: PersonaId;
  initialProfile: InvestorProfile;
  initialGoals: VisionGoal[];
  onComplete: (personaId: PersonaId, profile: InvestorProfile, goals: VisionGoal[]) => void;
  onLog: (event: string, detail: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialProfile.name);
  const [ageBand, setAgeBand] = useState(initialProfile.ageBand);
  const [surplus, setSurplus] = useState(initialProfile.surplus);
  const [experience, setExperience] = useState(initialProfile.experience);
  const [holdings, setHoldings] = useState<string[]>(initialProfile.holdings);
  const [horizon, setHorizon] = useState(initialProfile.horizon);
  const [objective, setObjective] = useState(initialProfile.objective);
  const [risk, setRisk] = useState(initialProfile.risk);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(initialPersona);
  const [goals, setGoals] = useState<VisionGoal[]>(initialGoals.length ? initialGoals : [goalOptions[0], goalOptions[1], goalOptions[4]]);
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalImage, setCustomGoalImage] = useState('');
  const suggestedPersona: PersonaId = objective === 'Fund future income' ? 'income' : risk < 35 ? 'keeper' : risk > 74 ? 'conviction' : objective === 'Invest with a mandate' ? 'mandate' : 'builder';

  const next = () => {
    if (step < 5) {
      setStep(step + 1);
      onLog('onboarding', `Completed profile step ${step}`);
    } else {
      onComplete(selectedPersona, {
        name: name.trim() || 'Your name',
        ageBand,
        surplus,
        experience,
        holdings,
        horizon,
        objective,
        risk,
      }, goals);
    }
  };
  const back = () => setStep(Math.max(1, step - 1));
  const toggleHolding = (holding: string) => setHoldings((current) => current.includes(holding) ? current.filter((item) => item !== holding) : [...current, holding]);
  const toggleGoal = (goal: VisionGoal) => setGoals((current) => current.some((item) => item.id === goal.id) ? current.filter((item) => item.id !== goal.id) : [...current, goal]);
  const moveGoal = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= goals.length) return;
    setGoals((current) => {
      const nextGoals = [...current];
      [nextGoals[index], nextGoals[target]] = [nextGoals[target], nextGoals[index]];
      return nextGoals;
    });
  };
  const handleCustomImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCustomGoalImage(URL.createObjectURL(file));
  };
  const addCustomGoal = () => {
    if (!customGoalTitle.trim()) return;
    setGoals((current) => [...current, {
      id: `custom-${Date.now()}`,
      title: customGoalTitle.trim(),
      caption: 'A goal that is uniquely yours',
      image: customGoalImage || goalOptions[6].image,
      amount: 'Choose later',
      timeframe: 'Choose later',
      custom: true,
    }]);
    setCustomGoalTitle('');
    setCustomGoalImage('');
  };
  const handleGoalDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData('goal-index'));
    if (!Number.isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      setGoals((current) => {
        const nextGoals = [...current];
        const [moved] = nextGoals.splice(sourceIndex, 1);
        nextGoals.splice(targetIndex, 0, moved);
        return nextGoals;
      });
    }
  };

  return (
    <div className="onboarding-wrap" data-testid="page-onboarding">
      <aside className="onboarding-aside">
        <div className="aside-brand">FINORA / 01</div>
        <div className="aside-content">
          <div className="eyebrow">Private intelligence workspace</div>
          <h2>Make the lens explicit.</h2>
          <p>Markets publish one event. Your time horizon, risk budget, and intent decide what it means. Start by giving FINORA the context a headline cannot.</p>
        </div>
        <div className="aside-foot">No brokerage connection required.<br />Your answers stay in this local simulation.</div>
      </aside>
      <main className="onboarding">
         <Link
           href="/"
           className="onboarding-close"
           data-testid="link-close-onboarding"
           aria-label="Exit investor profile and return to command center"
         >
           <X size={13} /> Exit profile
         </Link>
        <div className="progress-wrap">
           <div className="progress-meta"><span>Investor profile</span><span className="step-index">0{step} / 05</span></div>
           <div className="progress-track">{[1, 2, 3, 4, 5].map((item) => <span className={`progress-segment${item <= step ? ' filled' : ''}`} key={item} />)}</div>
        </div>

        <div className="question">
          {step === 1 && (
            <>
               <div className="eyebrow">01 · your details</div>
               <h1>Tell FINORA who is behind the portfolio.</h1>
               <p className="question-lead">A little context makes every signal more useful. Enter only what you are comfortable keeping in this local workspace.</p>
               <div className="form-grid">
                 <label className="field-label full"><span>Your name</span><div className="input-with-icon"><UserRound size={15} /><input value={name} data-testid="input-name" onChange={(event) => setName(event.target.value)} placeholder="e.g. Priya Sharma" /></div></label>
                 <label className="field-label"><span>Age band</span><select value={ageBand} data-testid="select-age-band" onChange={(event) => setAgeBand(event.target.value)}>{['18–25', '26–30', '31–40', '41–50', '51+'].map((item) => <option key={item}>{item}</option>)}</select></label>
                 <label className="field-label"><span>Monthly investable surplus</span><select value={surplus} data-testid="select-monthly-surplus" onChange={(event) => setSurplus(event.target.value)}>{['Below ₹25k / month', '₹25k – ₹50k / month', '₹50k – ₹1L / month', '₹1L+ / month'].map((item) => <option key={item}>{item}</option>)}</select></label>
                 <label className="field-label full"><span>Investing experience</span><div className="inline-choices">{['New', 'Beginner', 'Intermediate', 'Advanced'].map((item) => <button type="button" key={item} className={`choice-pill${experience === item ? ' selected' : ''}`} onClick={() => setExperience(item)}>{item}</button>)}</div></label>
                 <div className="field-label full"><span>Current holdings <em>optional</em></span><div className="inline-choices">{['Equity', 'Mutual funds', 'F&O', 'None'].map((item) => <button type="button" key={item} className={`choice-pill${holdings.includes(item) ? ' selected' : ''}`} onClick={() => toggleHolding(item)}>{item}</button>)}</div></div>
               </div>
            </>
          )}
          {step === 2 && (
            <>
               <div className="eyebrow">02 · direction</div>
               <h1>What are you building toward?</h1>
               <p className="question-lead">Time horizon and objective anchor every recommendation. There is no universally correct answer.</p>
               <div className="section-kicker" style={{ marginBottom: 9 }}>My horizon</div>
               <div className="choice-grid two">
                 {['1–3 years', '3–5 years', '5–10 years', '10+ years'].map((item) => <button type="button" className={`choice-card${horizon === item ? ' selected' : ''}`} key={item} data-testid={`button-horizon-${item}`} onClick={() => setHorizon(item)}><strong>{item}</strong><small>{item === '1–3 years' ? 'Near-term flexibility' : item === '10+ years' ? 'Generational compounding' : 'A considered runway'}</small></button>)}
               </div>
               <div className="section-kicker" style={{ margin: '25px 0 9px' }}>Primary objective</div>
               <div className="choice-grid two">
                 {['Grow wealth', 'Fund future income', 'Preserve capital', 'Invest with a mandate'].map((item) => <button type="button" className={`choice-card${objective === item ? ' selected' : ''}`} key={item} data-testid={`button-objective-${item}`} onClick={() => setObjective(item)}><strong>{item}</strong><small>{item === 'Grow wealth' ? 'Build purchasing power over time' : item === 'Fund future income' ? 'Create a reliable cash-flow rhythm' : item === 'Preserve capital' ? 'Keep optionality through cycles' : 'Return with accountability'}</small></button>)}
               </div>
             </>
           )}
           {step === 3 && (
             <>
               <div className="eyebrow">03 · risk budget + decision lens</div>
               <h1>How much uncertainty can you carry?</h1>
               <p className="question-lead">This is not a personality test. It is the drawdown you can stay rational through without abandoning the plan.</p>
              <div className="range-wrap">
                <div className="range-value"><strong>{risk}%</strong><span>maximum portfolio drawdown I can tolerate</span></div>
                <input type="range" min="10" max="90" value={risk} data-testid="input-risk-tolerance" onChange={(event) => setRisk(Number(event.target.value))} />
                <div className="range-labels"><span>Protect optionality</span><span>Accept volatility</span></div>
              </div>
              <div className="choice-grid two" style={{ marginTop: 12 }}>
                <div className="choice-card"><strong>Below 35%</strong><small>FINORA will favor capital preservation and wait for confirmation.</small></div>
                <div className="choice-card"><strong>Above 75%</strong><small>FINORA will surface asymmetric opportunities sooner, with guardrails.</small></div>
              </div>
               <div className="section-kicker" style={{ margin: '28px 0 9px' }}>Choose the voice that challenges you</div>
               <div className="persona-pick">
                 {personas.map((persona) => <button type="button" key={persona.id} className={`persona-tile${selectedPersona === persona.id ? ' selected' : ''}`} data-testid={`button-persona-${persona.id}`} onClick={() => setSelectedPersona(persona.id)}><strong>{persona.name}</strong><small>{persona.short}</small></button>)}
               </div>
               <span className="suggested"><Radar size={12} style={{ marginRight: 5 }} /> FINORA suggests {getPersona(suggestedPersona).name}</span>
             </>
           )}
           {step === 4 && (
            <>
               <div className="eyebrow">04 · vision board</div>
               <h1>Pin the life your money is meant to support.</h1>
               <p className="question-lead">Choose your goals, add a picture or a custom card, then drag the pins into priority order. Your top pin becomes the first Goal Planner lens.</p>
               <div className="vision-builder">
                 <div className="goal-gallery">
                   <div className="section-kicker">Goal library</div>
                   <div className="goal-options">
                     {goalOptions.map((goal) => <button type="button" className={`goal-option${goals.some((item) => item.id === goal.id) ? ' selected' : ''}`} key={goal.id} onClick={() => toggleGoal(goal)}><img src={goal.image} alt="" /><span><strong>{goal.title}</strong><small>{goal.caption}</small></span><span className="goal-check">{goals.some((item) => item.id === goal.id) ? <Check size={13} /> : <Plus size={13} />}</span></button>)}
                   </div>
                   <div className="custom-goal">
                     <div className="section-kicker">Add your own pin</div>
                     <div className="custom-goal-row"><input value={customGoalTitle} onChange={(event) => setCustomGoalTitle(event.target.value)} placeholder="e.g. Studio in Goa" /><label className="upload-button" title="Upload a picture"><Upload size={14} /><input type="file" accept="image/*" onChange={handleCustomImage} />{customGoalImage ? 'Picture added' : 'Picture'}</label><button className="button-outline compact" type="button" onClick={addCustomGoal} disabled={!customGoalTitle.trim()}><Pin size={13} /> Pin it</button></div>
                   </div>
                 </div>
                 <div className="vision-board" data-testid="vision-board">
                   <div className="board-header"><span><Pin size={14} /> My vision board</span><small>{goals.length} pinned · first pin is priority one</small></div>
                   <div className="board-canvas">
                     {goals.map((goal, index) => <div className={`vision-pin pin-${index % 5}`} draggable key={goal.id} onDragStart={(event) => event.dataTransfer.setData('goal-index', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleGoalDrop(event, index)}><span className="pin-head"><Pin size={14} fill="currentColor" /></span><img src={goal.image} alt="" /><div className="pin-copy"><strong>{goal.title}</strong><span>{index + 1}. priority · {goal.caption}</span></div><div className="pin-actions"><button type="button" aria-label={`Move ${goal.title} up`} onClick={() => moveGoal(index, -1)} disabled={index === 0}>↑</button><button type="button" aria-label={`Move ${goal.title} down`} onClick={() => moveGoal(index, 1)} disabled={index === goals.length - 1}>↓</button></div></div>)}
                     {!goals.length && <div className="board-empty"><ImagePlus size={24} /><strong>Start pinning your future</strong><span>Select a goal from the library or add your own picture.</span></div>}
                   </div>
                 </div>
               </div>
               {goals[0] && <div className="goal-detail-row"><div><span className="eyebrow">Priority one · {goals[0].title}</span><strong>Give this goal a range and a runway</strong></div><select value={goals[0].amount} onChange={(event) => setGoals((current) => current.map((goal, index) => index === 0 ? { ...goal, amount: event.target.value } : goal))}>{['Choose target amount', '₹5L – ₹10L', '₹10L – ₹25L', '₹25L – ₹50L', '₹50L – ₹1Cr', '₹1Cr+'].map((item) => <option key={item}>{item}</option>)}</select><select value={goals[0].timeframe} onChange={(event) => setGoals((current) => current.map((goal, index) => index === 0 ? { ...goal, timeframe: event.target.value } : goal))}>{['Choose timeframe', '1–3 years', '3–5 years', '5–10 years', '10–15 years', '15+ years'].map((item) => <option key={item}>{item}</option>)}</select></div>}
             </>
           )}
           {step === 5 && (
             <>
               <div className="eyebrow">05 · ready</div>
               <h1>{name.trim() || 'Your'} command center is calibrated.</h1>
               <p className="question-lead">FINORA will keep the event constant and make the trade-offs visible. You can change your lens without losing the evidence trail.</p>
               <div className="review-grid">
                 <div className="review-row"><label>Name / age</label><strong>{name || 'Not set'} · {ageBand}</strong></div>
                 <div className="review-row"><label>Experience</label><strong>{experience} · {holdings.length ? holdings.join(', ') : 'No holdings added'}</strong></div>
                 <div className="review-row"><label>Horizon / objective</label><strong>{horizon} · {objective}</strong></div>
                 <div className="review-row"><label>Priority one</label><strong>{goals[0]?.title ?? 'Add a goal'} · {goals[0]?.amount ?? ''}</strong></div>
                 <div className="review-row"><label>Active lens</label><strong>{getPersona(selectedPersona).name}</strong></div>
               </div>
               <div className="source-line" style={{ marginTop: 20 }}><LockKeyhole size={13} /><span>Stored locally in this prototype · no account connection</span></div>
            </>
          )}
        </div>
        <div className="onboarding-footer">
          {step > 1 ? <button className="button-quiet" type="button" data-testid="button-onboarding-back" onClick={back}><ArrowLeft size={13} /> Back</button> : <span />}
           <button className="button-primary" type="button" data-testid={step === 5 ? 'button-enter-command-center' : 'button-onboarding-next'} onClick={next}>
             {step === 5 ? 'Enter command center' : 'Continue'} <ArrowRight size={13} />
          </button>
        </div>
      </main>
    </div>
  );
}

function Router({
  personaId,
  setPersonaId,
  profile,
  setProfile,
  goals,
  setGoals,
  currency,
  setCurrency,
  selectedSignalId,
  setSelectedSignalId,
  onLog,
  logs,
  perfOpen,
  setPerfOpen,
  onToast,
}: {
  personaId: PersonaId;
  setPersonaId: (id: PersonaId) => void;
  profile: InvestorProfile;
  setProfile: (profile: InvestorProfile) => void;
  goals: VisionGoal[];
  setGoals: (goals: VisionGoal[]) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  selectedSignalId: string;
  setSelectedSignalId: (id: string) => void;
  onLog: (event: string, detail: string) => void;
  logs: LogEntry[];
  perfOpen: boolean;
  setPerfOpen: (open: boolean) => void;
  onToast: (message: string) => void;
}) {
  const [, setLocation] = useLocation();
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/onboarding">
          <OnboardingPage initialPersona={personaId} initialProfile={profile} initialGoals={goals} onComplete={(id, nextProfile, nextGoals) => { setPersonaId(id); setProfile(nextProfile); setGoals(nextGoals); onLog('profile saved', `${nextProfile.name}'s profile and ${nextGoals.length} vision pins saved`); setLocation('/'); }} onLog={onLog} />
        </Route>
        <Route path="/judge">
          <Shell personaId={personaId} profile={profile} currency={currency} onCurrencyChange={setCurrency} perfOpen={perfOpen} setPerfOpen={setPerfOpen} logs={logs} onLog={onLog}>
            <JudgePage personaId={personaId} selectedSignalId={selectedSignalId} onPersonaChange={setPersonaId} onLog={onLog} onToast={onToast} />
          </Shell>
        </Route>
        <Route path="/">
          <Shell personaId={personaId} profile={profile} currency={currency} onCurrencyChange={setCurrency} perfOpen={perfOpen} setPerfOpen={setPerfOpen} logs={logs} onLog={onLog}>
            <DashboardPage personaId={personaId} profile={profile} currency={currency} onPersonaChange={setPersonaId} onOpenJudge={(id) => { setSelectedSignalId(id); onLog('signal opened', `Reviewing ${id.toUpperCase()} in Judge Panel`); setLocation('/judge'); }} onLog={onLog} onToast={onToast} />
          </Shell>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [personaId, setPersonaId] = useState<PersonaId>('builder');
  const [profile, setProfile] = useState<InvestorProfile>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('finora-profile') || 'null') ?? defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [goals, setGoals] = useState<VisionGoal[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('finora-goals') || '[]') || [];
    } catch {
      return [];
    }
  });
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = window.localStorage.getItem('finora-currency');
    return currencyOptions.some((option) => option.code === saved) ? saved as CurrencyCode : 'INR';
  });
  const [selectedSignalId, setSelectedSignalId] = useState('nvda');
  const [perfOpen, setPerfOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '09:44', event: 'workspace ready', detail: 'Local evidence graph indexed in 142ms' },
    { time: '09:44', event: 'market snapshot', detail: '3 relevant signals found' },
  ]);

  const onLog = (event: string, detail: string) => {
    setLogs((current) => [...current, { time: nowLabel(), event, detail }]);
  };
  const onToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };
  useEffect(() => {
    window.localStorage.setItem('finora-profile', JSON.stringify(profile));
    window.localStorage.setItem('finora-goals', JSON.stringify(goals));
    window.localStorage.setItem('finora-currency', currency);
  }, [profile, goals, currency]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="finora-app">
            <FinancialAtmosphere />
            <Router personaId={personaId} setPersonaId={setPersonaId} profile={profile} setProfile={setProfile} goals={goals} setGoals={setGoals} currency={currency} setCurrency={setCurrency} selectedSignalId={selectedSignalId} setSelectedSignalId={setSelectedSignalId} onLog={onLog} logs={logs} perfOpen={perfOpen} setPerfOpen={setPerfOpen} onToast={onToast} />
            <Toaster />
            {toast && <div className="toast-note" role="status" data-testid="status-toast">{toast}</div>}
          </div>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
