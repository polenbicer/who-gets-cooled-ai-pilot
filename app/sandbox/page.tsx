'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Coins,
  Gavel,
  HeartPulse,
  Leaf,
  Megaphone,
  Scale,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';

type CityKey = 'Brussels' | 'Amsterdam' | 'Istanbul' | 'Izmir';

type District = {
  name: string;
  heat: number;
  poverty: number;
  elderly: number;
  housing: number;
  green: number;
  x: number;
  y: number;
};

type Stats = {
  heat: number;
  justice: number;
  approval: number;
  trust: number;
  council: number;
  budget: number;
  green: number;
  health: number;
  deaths: number;
};

type Effect = Partial<Stats> & { months?: number };

type Decision = {
  id: string;
  title: string;
  icon: string;
  description: string;
  cost: number;
  effect: Effect;
  tag: string;
};

type EventCard = {
  title: string;
  kicker: string;
  body: string;
  choices: Decision[];
};

const CITIES: Record<CityKey, {
  emoji: string;
  subtitle: string;
  description: string;
  districts: District[];
}> = {
  Brussels: {
    emoji: '🇧🇪',
    subtitle: 'Canal corridor / socio-spatial polarization',
    description: 'Dense urban fabric, strong inequalities and a politically sensitive canal corridor.',
    districts: [
      { name: 'Cureghem Bara', heat: 91, poverty: 94, elderly: 31, housing: 88, green: 18, x: 27, y: 61 },
      { name: 'Molenbeek', heat: 86, poverty: 91, elderly: 35, housing: 84, green: 24, x: 42, y: 47 },
      { name: 'Marolles', heat: 88, poverty: 79, elderly: 42, housing: 76, green: 27, x: 52, y: 66 },
      { name: 'Saint-Josse', heat: 90, poverty: 86, elderly: 29, housing: 81, green: 20, x: 63, y: 35 },
      { name: 'Châtelain', heat: 78, poverty: 42, elderly: 24, housing: 52, green: 48, x: 72, y: 60 },
      { name: "Vivier d'Oie", heat: 42, poverty: 18, elderly: 78, housing: 28, green: 72, x: 79, y: 82 },
    ],
  },
  Amsterdam: {
    emoji: '🇳🇱',
    subtitle: 'Historic centre / post-war estates',
    description: 'High-density central areas meet vulnerable neighbourhoods in Nieuw-West and Zuidoost.',
    districts: [
      { name: 'Nieuw-West', heat: 68, poverty: 82, elderly: 41, housing: 70, green: 43, x: 25, y: 47 },
      { name: 'Zuidoost', heat: 72, poverty: 78, elderly: 38, housing: 73, green: 49, x: 68, y: 76 },
      { name: 'Kolenkit', heat: 81, poverty: 86, elderly: 34, housing: 78, green: 25, x: 39, y: 38 },
      { name: 'Burgwallen', heat: 94, poverty: 67, elderly: 45, housing: 59, green: 22, x: 52, y: 49 },
      { name: 'Indische Buurt', heat: 76, poverty: 74, elderly: 69, housing: 63, green: 31, x: 72, y: 42 },
      { name: 'Buitenveldert', heat: 54, poverty: 29, elderly: 82, housing: 34, green: 68, x: 56, y: 80 },
    ],
  },
  Istanbul: {
    emoji: '🇹🇷',
    subtitle: 'Extreme density / northern green belt',
    description: 'Heat-intensive corridors, dense housing and a sharp contrast with greener northern areas.',
    districts: [
      { name: 'Bağcılar', heat: 96, poverty: 84, elderly: 27, housing: 91, green: 14, x: 29, y: 55 },
      { name: 'Fatih', heat: 93, poverty: 70, elderly: 56, housing: 78, green: 18, x: 52, y: 50 },
      { name: 'Esenler', heat: 91, poverty: 81, elderly: 31, housing: 89, green: 16, x: 39, y: 72 },
      { name: 'Kadıköy', heat: 74, poverty: 37, elderly: 66, housing: 43, green: 42, x: 70, y: 64 },
      { name: 'Üsküdar', heat: 67, poverty: 33, elderly: 73, housing: 39, green: 51, x: 78, y: 45 },
      { name: 'Northern Belt', heat: 39, poverty: 21, elderly: 24, housing: 27, green: 87, x: 72, y: 18 },
    ],
  },
  Izmir: {
    emoji: '🇹🇷',
    subtitle: 'Mediterranean heat / coastal ageing',
    description: 'Hot central basins coexist with elderly coastal communities and uneven housing quality.',
    districts: [
      { name: 'Konak', heat: 94, poverty: 68, elderly: 61, housing: 72, green: 21, x: 49, y: 52 },
      { name: 'Buca', heat: 91, poverty: 76, elderly: 38, housing: 83, green: 19, x: 36, y: 71 },
      { name: 'Karşıyaka', heat: 72, poverty: 31, elderly: 82, housing: 41, green: 48, x: 69, y: 37 },
      { name: 'Bornova', heat: 84, poverty: 59, elderly: 49, housing: 64, green: 31, x: 65, y: 62 },
      { name: 'Bayraklı', heat: 88, poverty: 72, elderly: 44, housing: 79, green: 22, x: 55, y: 29 },
      { name: 'Güzelbahçe', heat: 57, poverty: 24, elderly: 69, housing: 35, green: 67, x: 24, y: 36 },
    ],
  },
};

const BASE_STATS: Stats = {
  heat: 68,
  justice: 50,
  approval: 60,
  trust: 60,
  council: 55,
  budget: 100,
  green: 35,
  health: 55,
  deaths: 0,
};

const EVENTS: EventCard[] = [
  {
    title: 'The Heatwave Is Coming',
    kicker: 'EMERGENCY FORECAST · 38°C',
    body: 'Meteorologists forecast three dangerous days. Hospitals ask for immediate support while your infrastructure team warns that long-term projects are already stretched.',
    choices: [
      {
        id: 'shelters',
        title: 'Open cooling shelters',
        icon: '💧',
        description: 'Open libraries, sports halls and schools as free cooling centres.',
        cost: 12,
        effect: { heat: -5, health: 8, approval: 7, justice: 5, trust: 4, council: -2, deaths: -3 },
        tag: 'FAST RELIEF',
      },
      {
        id: 'ac',
        title: 'Emergency AC subsidy',
        icon: '❄️',
        description: 'Subsidise cooling bills for households that apply.',
        cost: 18,
        effect: { heat: -7, approval: 9, health: 6, justice: -2, trust: 2, deaths: -4 },
        tag: 'POPULAR',
      },
      {
        id: 'trees',
        title: 'Accelerate shade programme',
        icon: '🌳',
        description: 'Redirect crews to trees, shade sails and reflective streets.',
        cost: 25,
        effect: { heat: -10, green: 10, justice: 6, approval: 2, trust: 5, council: -4, deaths: -2 },
        tag: 'LONG TERM',
      },
      {
        id: 'nothing',
        title: 'Hold the line',
        icon: '🧊',
        description: 'Keep the budget intact and trust existing emergency services.',
        cost: 0,
        effect: { heat: 4, approval: -8, trust: -7, council: 3, deaths: 5 },
        tag: 'RISKY',
      },
    ],
  },
  {
    title: 'The Algorithm Has a Blind Spot',
    kicker: 'AI AUDIT · PROCEDURAL JUSTICE',
    body: 'Your climate model ranks a wealthy central district above an informal housing area. Residents argue that satellite heat alone cannot capture lived vulnerability.',
    choices: [
      {
        id: 'override',
        title: 'Override the model',
        icon: '🧠',
        description: 'Give human vulnerability data a higher priority than the automated ranking.',
        cost: 4,
        effect: { justice: 10, trust: 8, council: -5, approval: 3 },
        tag: 'HUMAN OVERRIDE',
      },
      {
        id: 'audit',
        title: 'Launch an algorithm audit',
        icon: '🔎',
        description: 'Pause allocation for one cycle and commission an independent review.',
        cost: 8,
        effect: { justice: 7, trust: 12, council: 3, approval: -2 },
        tag: 'TRANSPARENT',
      },
      {
        id: 'follow',
        title: 'Follow the ranking',
        icon: '📊',
        description: 'Use the model consistently and publish its methodology.',
        cost: 0,
        effect: { trust: -1, council: 7, approval: 1 },
        tag: 'TECHNOCRATIC',
      },
    ],
  },
  {
    title: 'Developers Arrive With €40M',
    kicker: 'ECONOMY · PRIVATE CAPITAL',
    body: 'A consortium offers major investment in a new mixed-use district — but asks for weaker cooling standards and a faster planning process.',
    choices: [
      {
        id: 'accept',
        title: 'Accept the deal',
        icon: '🏗️',
        description: 'Unlock private investment and jobs, with limited climate conditions.',
        cost: 0,
        effect: { approval: 5, council: 10, trust: -7, justice: -8, heat: 3 },
        tag: 'GROWTH',
      },
      {
        id: 'conditions',
        title: 'Accept with conditions',
        icon: '⚖️',
        description: 'Require shade, cool roofs and affordable housing in the development.',
        cost: 6,
        effect: { approval: 3, council: 4, trust: 5, justice: 6, heat: -4 },
        tag: 'BALANCED',
      },
      {
        id: 'reject',
        title: 'Reject the offer',
        icon: '🚫',
        description: 'Protect adaptation standards and keep public control.',
        cost: 0,
        effect: { council: -9, trust: 8, justice: 7, approval: -1 },
        tag: 'GREEN FIRST',
      },
    ],
  },
  {
    title: 'The Elderly Association Calls',
    kicker: 'PUBLIC HEALTH · NIGHT-TIME RISK',
    body: 'Night-time temperatures remain high. Isolated older residents are not appearing in the top heat-risk districts because the model lacks social isolation data.',
    choices: [
      {
        id: 'checkins',
        title: 'Fund neighbour check-ins',
        icon: '🤝',
        description: 'Pay community organisations to contact isolated residents.',
        cost: 7,
        effect: { health: 10, justice: 7, trust: 8, approval: 5, deaths: -5 },
        tag: 'RECOGNITION',
      },
      {
        id: 'medical',
        title: 'Expand hospital capacity',
        icon: '🏥',
        description: 'Create extra heat-response beds and ambulance capacity.',
        cost: 16,
        effect: { health: 18, approval: 6, deaths: -7, justice: 2 },
        tag: 'HEALTH',
      },
      {
        id: 'ignore',
        title: 'Stay with the model',
        icon: '📐',
        description: 'Do not change the allocation framework mid-year.',
        cost: 0,
        effect: { health: -3, justice: -5, trust: -8, deaths: 4 },
        tag: 'CONSISTENCY',
      },
    ],
  },
  {
    title: 'Council Demands A Budget Cut',
    kicker: 'FISCAL CRISIS · €15M CUT',
    body: 'The finance committee says your climate programme is over budget. You must either cut a flagship project or raise a politically unpopular local levy.',
    choices: [
      {
        id: 'cut-green',
        title: 'Cut the green programme',
        icon: '✂️',
        description: 'Delay long-term tree canopy and public-space works.',
        cost: 0,
        effect: { green: -8, heat: 3, council: 8, approval: 2, trust: -4 },
        tag: 'SHORT TERM',
      },
      {
        id: 'levy',
        title: 'Introduce a climate levy',
        icon: '💶',
        description: 'Raise a modest levy earmarked for adaptation.',
        cost: -15,
        effect: { approval: -8, trust: 4, justice: 4, council: -3, green: 5 },
        tag: 'BRAVE',
      },
      {
        id: 'progressive',
        title: 'Renegotiate by ability to pay',
        icon: '⚖️',
        description: 'Protect low-income households and increase contributions at the top.',
        cost: -8,
        effect: { approval: 1, trust: 8, justice: 9, council: -6, green: 3 },
        tag: 'EQUITY',
      },
    ],
  },
];

const FINAL_EVENT: EventCard = {
  title: 'Election Day: One Last Decision',
  kicker: 'FINAL TURN · YOUR LEGACY',
  body: 'You have one final intervention before voters decide. Your record is public. The question is no longer what is theoretically optimal — it is what kind of mayor you became.',
  choices: [
    {
      id: 'last-mile',
      title: 'Protect the most vulnerable',
      icon: '❤️',
      description: 'Spend the remaining political and financial capital on the highest-risk districts.',
      cost: 8,
      effect: { heat: -6, justice: 12, approval: 8, trust: 8, health: 5, deaths: -4 },
      tag: 'JUSTICE',
    },
    {
      id: 'legacy-green',
      title: 'Finish the green network',
      icon: '🌳',
      description: 'Deliver the visible long-term climate legacy voters can walk through.',
      cost: 12,
      effect: { heat: -8, green: 12, justice: 6, approval: 6, trust: 4 },
      tag: 'CLIMATE',
    },
    {
      id: 'stability',
      title: 'Balance the books',
      icon: '📒',
      description: 'Freeze spending, preserve services and campaign on fiscal responsibility.',
      cost: 0,
      effect: { council: 8, approval: 5, trust: 2, justice: -3 },
      tag: 'STABILITY',
    },
  ],
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function money(n: number) {
  return `€${Math.abs(n).toFixed(0)}M`;
}

function getLegacy(stats: Stats) {
  const scores = [
    { key: 'CLIMATE CHAMPION', score: (100 - stats.heat) * 0.7 + stats.green * 0.3 },
    { key: 'JUSTICE MAYOR', score: stats.justice * 0.8 + stats.trust * 0.2 },
    { key: 'PUBLIC HEALTH MAYOR', score: stats.health * 0.8 + (100 - stats.deaths * 4) * 0.2 },
    { key: "PEOPLE'S MAYOR", score: stats.approval * 0.55 + stats.trust * 0.45 },
    { key: 'POLITICAL SURVIVOR', score: stats.approval * 0.45 + stats.council * 0.55 },
    { key: 'BALANCED MAYOR', score: (
      (100 - stats.heat) +
      stats.justice +
      stats.approval +
      stats.trust +
      stats.council +
      stats.health
    ) / 6 },
  ].sort((a, b) => b.score - a.score);

  const balanced =
    stats.heat <= 48 &&
    stats.justice >= 68 &&
    stats.approval >= 65 &&
    stats.trust >= 65 &&
    stats.council >= 50 &&
    stats.budget >= 5;

  return balanced ? 'BALANCED MAYOR' : scores[0].key;
}

function endingFor(stats: Stats) {
  if (stats.deaths >= 16 || stats.heat >= 90) {
    return {
      type: 'LOSS',
      title: 'CLIMATE FAILURE',
      text: 'The city endured a preventable public-health disaster. Your administration kept plans on paper while heat became an emergency.',
    };
  }
  if (stats.budget < 0) {
    return {
      type: 'LOSS',
      title: 'FISCAL COLLAPSE',
      text: 'The adaptation programme ran out of money before it could become resilient. The council appointed an emergency budget committee.',
    };
  }
  if (stats.approval < 25 || stats.trust < 20) {
    return {
      type: 'LOSS',
      title: 'ELECTION DEFEAT',
      text: 'Voters did not trust the direction of your administration. Your successor inherits a city still searching for a climate consensus.',
    };
  }
  if (stats.justice < 30) {
    return {
      type: 'LOSS',
      title: 'JUSTICE FAILURE',
      text: 'The city cooled its most visible districts while vulnerable communities remained exposed. The audit labels the programme distributively unjust.',
    };
  }
  return {
    type: 'WIN',
    title: getLegacy(stats),
    text: 'You did not find a perfect solution. You made trade-offs, exposed who benefited, and left a measurable legacy.',
  };
}

function StatBar({
  label,
  value,
  icon,
  inverse = false,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  inverse?: boolean;
}) {
  const shown = inverse ? Math.max(0, 100 - value) : value;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-slate-600">{icon}{label}</span>
        <span className="font-mono text-slate-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-slate-900 transition-all duration-500" style={{ width: `${shown}%` }} />
      </div>
    </div>
  );
}

export default function MayorSandbox() {
  const [screen, setScreen] = useState<'intro' | 'city' | 'game' | 'end'>('intro');
  const [city, setCity] = useState<CityKey>('Brussels');
  const [turn, setTurn] = useState(1);
  const [stats, setStats] = useState<Stats>(BASE_STATS);
  const [eventIndex, setEventIndex] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [lastChoice, setLastChoice] = useState<string | null>(null);

  const currentEvent = turn === 12 ? FINAL_EVENT : EVENTS[eventIndex % EVENTS.length];
  const districts = CITIES[city].districts;
  const district = districts[selectedDistrict];

  const weightedRisk = useMemo(() => {
    return districts
      .map((d) => ({
        ...d,
        score: Math.round(d.heat * 0.5 + d.poverty * 0.25 + d.elderly * 0.15 + d.housing * 0.1),
      }))
      .sort((a, b) => b.score - a.score);
  }, [districts]);

  const reset = () => {
    setScreen('intro');
    setCity('Brussels');
    setTurn(1);
    setStats(BASE_STATS);
    setEventIndex(0);
    setSelectedDistrict(0);
    setLog([]);
    setLastChoice(null);
  };

  const startGame = () => {
    setScreen('city');
    setStats(BASE_STATS);
    setTurn(1);
    setEventIndex(0);
    setLog([]);
    setLastChoice(null);
  };

  const chooseCity = (next: CityKey) => {
    setCity(next);
    setSelectedDistrict(0);
  };

  const applyChoice = (choice: Decision) => {
    const next: Stats = { ...stats };

    next.budget -= choice.cost;
    (Object.keys(choice.effect) as Array<keyof Effect>).forEach((key) => {
      if (key === 'months') return;
      const delta = choice.effect[key] ?? 0;
      const statKey = key as keyof Stats;
      next[statKey] = clamp(next[statKey] + delta);
    });

    // Small systemic effects: heat amplifies approval pressure, and poor justice
    // makes future events harder.
    if (next.heat > 75) next.approval = clamp(next.approval - 2);
    if (next.justice < 35) next.trust = clamp(next.trust - 2);
    if (next.budget < 10) next.council = clamp(next.council - 2);

    setStats(next);
    setLastChoice(choice.id);
    setLog((old) => [`Turn ${turn}: ${choice.title}`, ...old].slice(0, 6));

    if (turn >= 12) {
      setScreen('end');
      return;
    }

    setTurn((t) => t + 1);
    setEventIndex((i) => i + 1);
  };

  const end = endingFor(stats);

  if (screen === 'intro') {
    return (
      <main className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
          <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <section>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-orange-300">
                <BrainCircuit className="size-3.5" /> Urban AI Governance Game
              </div>
              <h1 className="max-w-3xl font-serif text-5xl font-black leading-[.98] tracking-tight md:text-7xl">
                WHO GETS
                <br />
                <span className="text-orange-400">COOLED?</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                You are the mayor. A heatwave is coming. Your budget is finite,
                your citizens disagree, and your algorithm is not neutral.
                Protect the city — and survive the politics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold">
                {['12 turns', '4 cities', '20+ decisions', 'Multiple endings'].map((x) => (
                  <span key={x} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">{x}</span>
                ))}
              </div>
              <button
                onClick={startGame}
                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-950/30 transition hover:bg-orange-400"
              >
                ENTER THE MAYOR'S OFFICE <ArrowRight className="size-4" />
              </button>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[.04] p-5 shadow-2xl">
              <div className="rounded-2xl bg-[#161d26] p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Emergency dashboard</span>
                  <span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-300">LIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5">
                  {[
                    ['🌡️', 'Heat risk', '68'],
                    ['⚖️', 'Justice', '50'],
                    ['👍', 'Approval', '60'],
                    ['💶', 'Budget', '€100M'],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-white/[.03] p-4">
                      <div className="text-lg">{icon}</div>
                      <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
                      <div className="mt-1 font-mono text-xl font-bold">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-orange-400/20 bg-orange-400/5 p-4 text-xs leading-5 text-orange-100">
                  <strong>Mayor's briefing:</strong> “AI can rank risk. It cannot decide what your city owes its people.”
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'city') {
    return (
      <main className="min-h-screen bg-[#fafaf9] text-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Step 01 · Choose your city</span>
            <h1 className="mt-2 font-serif text-4xl font-black md:text-5xl">Every city has a different political problem.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">The rules are shared, but the pressure points are not. Choose where you want to govern.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(CITIES) as CityKey[]).map((key) => {
              const c = CITIES[key];
              const active = city === key;
              return (
                <button
                  key={key}
                  onClick={() => chooseCity(key)}
                  className={`group rounded-2xl border p-6 text-left transition ${
                    active ? 'border-slate-900 bg-slate-950 text-white shadow-xl' : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{c.emoji}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${active ? 'bg-white/10 text-orange-300' : 'bg-stone-100 text-stone-500'}`}>
                      {active ? 'SELECTED' : 'SELECT'}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-black">{key}</h2>
                  <p className={`mt-1 text-xs font-semibold ${active ? 'text-orange-300' : 'text-orange-700'}`}>{c.subtitle}</p>
                  <p className={`mt-4 text-sm leading-6 ${active ? 'text-slate-300' : 'text-stone-600'}`}>{c.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your choice</p>
              <p className="mt-1 font-serif text-xl font-bold">{CITIES[city].emoji} {city}</p>
            </div>
            <button onClick={() => setScreen('game')} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white hover:bg-orange-600">
              TAKE OFFICE <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'end') {
    const balanced = end.title === 'BALANCED MAYOR';
    return (
      <main className="min-h-screen bg-[#0d1117] px-5 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className={`rounded-3xl border p-8 md:p-12 ${end.type === 'WIN' ? 'border-orange-400/20 bg-orange-400/[.04]' : 'border-red-400/20 bg-red-400/[.04]'}`}>
            <div className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
              {end.type === 'WIN' ? '12 turns completed · Election result' : 'Administration concluded'}
            </div>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl font-black md:text-7xl">{end.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{end.text}</p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['🌡️', 'Heat risk', stats.heat, stats.heat <= 48],
                ['⚖️', 'Justice', stats.justice, stats.justice >= 68],
                ['👍', 'Approval', stats.approval, stats.approval >= 65],
                ['🤝', 'Trust', stats.trust, stats.trust >= 65],
                ['🏛️', 'Council', stats.council, stats.council >= 50],
                ['🏥', 'Health', stats.health, stats.health >= 65],
                ['🌳', 'Green', stats.green, stats.green >= 50],
                ['💶', 'Budget', money(stats.budget), stats.budget >= 5],
              ].map(([icon, label, value, good]) => (
                <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[.04] p-4">
                  <div className="flex items-center justify-between">
                    <span>{icon}</span>
                    {good ? <Check className="size-4 text-emerald-300" /> : <span className="text-xs text-slate-500">—</span>}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="mt-1 font-mono text-2xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-[1fr_.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                <div className="flex items-center gap-2 text-sm font-bold"><Trophy className="size-4 text-orange-300" /> Your legacy</div>
                <div className="mt-4 space-y-3 text-xs text-slate-300">
                  {log.slice().reverse().map((item) => (
                    <div key={item} className="flex items-center gap-2"><ChevronRight className="size-3 text-orange-300" />{item}</div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 text-slate-900">
                <p className="text-xs font-black uppercase tracking-widest text-stone-400">The question you leave behind</p>
                <p className="mt-3 font-serif text-2xl font-bold leading-tight">
                  “Who did the city protect first — and who paid the price?”
                </p>
                <p className="mt-4 text-xs leading-5 text-stone-500">
                  {balanced
                    ? 'You kept climate performance, justice, trust and political stability above the danger thresholds.'
                    : 'A different weighting of climate, social vulnerability and political capital would have produced a different city.'}
                </p>
              </div>
            </div>

            <button onClick={reset} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black hover:bg-orange-400">
              PLAY AGAIN <Sparkles className="size-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-slate-950 text-lg">👑</div>
            <div>
              <div className="font-serif text-sm font-black">WHO GETS COOLED?</div>
              <div className="text-[10px] font-semibold text-stone-400">{CITIES[city].emoji} {city} · MAYOR MODE</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-lg bg-stone-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-stone-500">Turn {turn} / 12</span>
            <span className="rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white">{money(stats.budget)} remaining</span>
          </div>
          <button onClick={reset} className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:bg-stone-100" title="Restart">
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-5 md:px-6">
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">City pulse</span>
                <BarChart3 className="size-4 text-orange-600" />
              </div>
              <div className="space-y-4">
                <StatBar label="Heat risk" value={stats.heat} icon={<Zap className="size-3 text-red-500" />} />
                <StatBar label="Spatial justice" value={stats.justice} icon={<Scale className="size-3 text-blue-500" />} />
                <StatBar label="Public approval" value={stats.approval} icon={<Users className="size-3 text-emerald-500" />} />
                <StatBar label="Citizen trust" value={stats.trust} icon={<HeartPulse className="size-3 text-pink-500" />} />
                <StatBar label="Council support" value={stats.council} icon={<Gavel className="size-3 text-violet-500" />} />
                <StatBar label="Green coverage" value={stats.green} icon={<Leaf className="size-3 text-green-600" />} />
                <StatBar label="Health capacity" value={stats.health} icon={<ShieldAlert className="size-3 text-cyan-600" />} />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2 text-xs font-bold"><Coins className="size-4 text-orange-300" /> Budget office</div>
              <div className="mt-2 font-mono text-3xl font-black">{money(stats.budget)}</div>
              <div className="mt-2 text-[10px] leading-4 text-slate-400">Spend now, pay later — or preserve fiscal room for the next crisis.</div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-black"><Megaphone className="size-4 text-orange-600" /> Stakeholder radar</div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span>Citizens</span><b>{stats.approval}/100</b></div>
                <div className="flex justify-between"><span>Community groups</span><b>{stats.trust}/100</b></div>
                <div className="flex justify-between"><span>City council</span><b>{stats.council}/100</b></div>
                <div className="flex justify-between"><span>Hospitals</span><b>{stats.health}/100</b></div>
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-stone-200 bg-[#dfe8e2] shadow-sm">
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage: 'linear-gradient(30deg, rgba(255,255,255,.7) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,.7) 87.5%, rgba(255,255,255,.7)), linear-gradient(150deg, rgba(255,255,255,.7) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,.7) 87.5%, rgba(255,255,255,.7))',
                backgroundSize: '80px 140px',
                backgroundPosition: '0 0, 40px 70px',
              }} />
              <div className="absolute left-5 top-5 z-10 rounded-xl border border-white/70 bg-white/85 p-3 backdrop-blur">
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Priority map</div>
                <div className="mt-1 font-serif text-xl font-bold">Who should be cooled first?</div>
              </div>
              {districts.map((d, i) => {
                const selected = i === selectedDistrict;
                const risk = Math.round(d.heat * .6 + d.poverty * .25 + d.elderly * .15);
                const size = 40 + Math.round(risk * .35);
                return (
                  <button
                    key={d.name}
                    onClick={() => setSelectedDistrict(i)}
                    className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-xl transition hover:scale-110 ${selected ? 'ring-4 ring-orange-400/60' : ''}`}
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: size,
                      height: size,
                      background: risk > 80 ? '#dc2626' : risk > 65 ? '#f59e0b' : '#0f766e',
                    }}
                  >
                    <span className="text-[9px] font-black text-white">{risk}</span>
                  </button>
                );
              })}
              <div className="absolute bottom-5 left-5 z-10 flex gap-2 rounded-xl border border-white/70 bg-white/85 p-2 text-[9px] font-bold backdrop-blur">
                <span>🔴 Critical</span><span>🟠 High</span><span>🟢 Lower</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">Selected district</div>
                  <h2 className="mt-1 font-serif text-2xl font-black">{district.name}</h2>
                  <p className="mt-1 text-xs text-stone-500">AI priority score: <b>{weightedRisk.find((x) => x.name === district.name)?.score}</b> / 100</p>
                </div>
                <span className="rounded-lg bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-500">CLICK A DISTRICT</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  ['Heat', district.heat],
                  ['Poverty', district.poverty],
                  ['Elderly', district.elderly],
                  ['Housing', district.housing],
                  ['Green', district.green],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-stone-50 p-3">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{label}</div>
                    <div className="mt-1 font-mono text-lg font-black">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                <Sparkles className="size-4" /> {currentEvent.kicker}
              </div>
              <h2 className="mt-3 font-serif text-3xl font-black leading-tight">{currentEvent.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">{currentEvent.body}</p>

              <div className="mt-5 space-y-2">
                {currentEvent.choices.map((choice) => {
                  const disabled = choice.cost > stats.budget;
                  const selected = lastChoice === choice.id && turn > 1;
                  return (
                    <button
                      key={choice.id}
                      disabled={disabled}
                      onClick={() => applyChoice(choice)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selected
                          ? 'border-emerald-300 bg-emerald-50'
                          : disabled
                            ? 'cursor-not-allowed border-stone-100 bg-stone-50 opacity-45'
                            : 'border-stone-200 bg-stone-50 hover:border-slate-900 hover:bg-white'
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className="text-xl">{choice.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black">{choice.title}</span>
                            <span className="shrink-0 font-mono text-[10px] font-black text-orange-700">
                              {choice.cost === 0 ? 'FREE' : choice.cost < 0 ? `+${money(choice.cost)}` : `-${money(choice.cost)}`}
                            </span>
                          </span>
                          <span className="mt-1 block text-[10px] leading-4 text-stone-500">{choice.description}</span>
                          <span className="mt-2 inline-block rounded bg-white px-1.5 py-1 text-[8px] font-black tracking-wider text-stone-400">{choice.tag}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Decision log</div>
              <div className="mt-3 space-y-2">
                {log.length === 0 ? (
                  <p className="text-xs text-stone-400">Your first decision will appear here.</p>
                ) : (
                  log.map((item) => (
                    <div key={item} className="flex gap-2 text-[10px] leading-4 text-stone-600">
                      <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" /> {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2 text-xs font-bold"><BrainCircuit className="size-4 text-sky-300" /> AI advisory note</div>
              <p className="mt-3 text-[11px] leading-5 text-slate-300">
                The model can structure evidence, but the weights are political choices. If you override the ranking, the city will remember.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
