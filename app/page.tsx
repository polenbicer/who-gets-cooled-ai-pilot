'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  Coins,
  Compass,
  FileSpreadsheet,
  Flame,
  Gavel,
  Globe,
  HeartPulse,
  Info,
  Layers,
  Leaf,
  Megaphone,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trophy,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ==================== DASHBOARD TYPES & DATA ====================
type City = 'Brussels' | 'Amsterdam' | 'Istanbul' | 'Izmir';
type Scenario = 'heat' | 'balanced' | 'justice';

type Neighbourhood = {
  city: City;
  name: string;
  heat: number;
  age: number;
  income: number;
  profile: string;
  lat?: number;
  lng?: number;
};

const DATASETS: Neighbourhood[] = [
  // Amsterdam (10)
  { city: 'Amsterdam', name: 'Amsterdamse Poort e.o.', heat: 1.73, age: 1.90, income: 5.00, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Amsterdam', name: 'De Kolenkit', heat: 1.98, age: 2.13, income: 4.62, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Amsterdam', name: 'Burgwallen-Oude Zijde', heat: 5.00, age: 2.59, income: 4.90, profile: 'High heat + income vulnerability' },
  { city: 'Amsterdam', name: 'Apollobuurt', heat: 2.50, age: 4.40, income: 1.00, profile: 'High elderly demographic vulnerability' },
  { city: 'Amsterdam', name: 'Buitenveldert-West', heat: 1.58, age: 5.00, income: 3.97, profile: 'High elderly demographic vulnerability' },
  { city: 'Amsterdam', name: 'Indische Buurt-Oost', heat: 1.63, age: 4.13, income: 4.84, profile: 'High elderly demographic vulnerability' },
  { city: 'Amsterdam', name: 'Nieuw-West', heat: 1.40, age: 3.14, income: 4.49, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Amsterdam', name: 'Noord', heat: 1.00, age: 3.53, income: 4.48, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Amsterdam', name: 'Oost', heat: 1.58, age: 2.93, income: 4.02, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Amsterdam', name: 'Zuidas', heat: 2.05, age: 1.00, income: 3.99, profile: 'Balanced urban profile / lower thermal risk' },

  // Brussels (10)
  { city: 'Brussels', name: 'Marolles', heat: 4.79, age: 2.33, income: 4.87, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Molenbeek Historique', heat: 4.77, age: 1.63, income: 5.00, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Cureghem Bara', heat: 5.00, age: 1.10, income: 4.95, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Châtelain', heat: 4.23, age: 1.45, income: 2.56, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: "Vivier d'Oie", heat: 1.00, age: 5.00, income: 1.00, profile: 'High elderly demographic vulnerability' },
  { city: 'Brussels', name: 'Colignon', heat: 4.54, age: 1.57, income: 4.28, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Saint-Josse Centre', heat: 4.71, age: 1.47, income: 4.56, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Matonge', heat: 4.84, age: 1.00, income: 3.66, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Auderghem centre', heat: 3.22, age: 3.07, income: 1.92, profile: 'Balanced urban profile / lower thermal risk' },
  { city: 'Brussels', name: 'Observatoire', heat: 1.80, age: 4.48, income: 1.56, profile: 'High elderly demographic vulnerability' },

  // Istanbul (10)
  { city: 'Istanbul', name: 'Bağcılar', heat: 5.00, age: 1.30, income: 3.93, profile: 'High heat + income vulnerability' },
  { city: 'Istanbul', name: 'Esenyurt', heat: 4.45, age: 1.00, income: 3.84, profile: 'High heat + income vulnerability' },
  { city: 'Istanbul', name: 'Fatih', heat: 4.77, age: 3.03, income: 2.78, profile: 'High heat + income vulnerability' },
  { city: 'Istanbul', name: 'Sultanbeyli', heat: 4.20, age: 1.00, income: 5.00, profile: 'High heat + income vulnerability' },
  { city: 'Istanbul', name: 'Ümraniye', heat: 3.79, age: 1.66, income: 3.28, profile: 'Balanced urban profile / lower thermal risk' },
  { city: 'Istanbul', name: 'Şişli', heat: 4.09, age: 2.91, income: 1.00, profile: 'High heat + income vulnerability' },
  { city: 'Istanbul', name: 'Bakırköy', heat: 3.20, age: 3.97, income: 2.63, profile: 'Balanced urban profile / lower thermal risk' },
  { city: 'Istanbul', name: 'Kadıköy', heat: 3.12, age: 5.00, income: 2.36, profile: 'High elderly demographic vulnerability' },
  { city: 'Istanbul', name: 'Beşiktaş', heat: 2.43, age: 4.20, income: 1.68, profile: 'High elderly demographic vulnerability' },
  { city: 'Istanbul', name: 'Sarıyer', heat: 1.00, age: 2.58, income: 3.34, profile: 'Balanced urban profile / lower thermal risk' },

  // Izmir (10)
  { city: 'Izmir', name: 'Konak', heat: 5.00, age: 4.81, income: 1.00, profile: 'High heat + income vulnerability' },
  { city: 'Izmir', name: 'Karabağlar', heat: 4.59, age: 2.77, income: 4.64, profile: 'High heat + income vulnerability' },
  { city: 'Izmir', name: 'Buca', heat: 4.69, age: 1.78, income: 4.42, profile: 'High heat + income vulnerability' },
  { city: 'Izmir', name: 'Bornova', heat: 4.19, age: 2.17, income: 1.65, profile: 'High heat + income vulnerability' },
  { city: 'Izmir', name: 'Menemen', heat: 2.50, age: 1.00, income: 5.00, profile: 'High income vulnerability / subsidy dependency' },
  { city: 'Izmir', name: 'Gaziemir', heat: 3.68, age: 1.79, income: 3.25, profile: 'Balanced urban profile / lower thermal risk' },
  { city: 'Izmir', name: 'Çiğli', heat: 3.35, age: 2.05, income: 3.18, profile: 'Balanced urban profile / lower thermal risk' },
  { city: 'Izmir', name: 'Karşıyaka', heat: 2.94, age: 5.00, income: 2.89, profile: 'High elderly demographic vulnerability' },
  { city: 'Izmir', name: 'Balçova', heat: 1.21, age: 4.81, income: 1.87, profile: 'High elderly demographic vulnerability' },
  { city: 'Izmir', name: 'Çeşme', heat: 1.00, age: 4.74, income: 3.33, profile: 'High elderly demographic vulnerability' },
];

const REAL_COORDS: Record<string, { lat: number; lng: number }> = {
  // Brussels
  'Marolles': { lat: 50.8385, lng: 4.3468 },
  'Molenbeek Historique': { lat: 50.8546, lng: 4.3340 },
  'Cureghem Bara': { lat: 50.8402, lng: 4.3308 },
  'Châtelain': { lat: 50.8242, lng: 4.3601 },
  "Vivier d'Oie": { lat: 50.7892, lng: 4.3755 },
  'Colignon': { lat: 50.8580, lng: 4.3750 },
  'Saint-Josse Centre': { lat: 50.8500, lng: 4.3700 },
  'Matonge': { lat: 50.8350, lng: 4.3680 },
  'Auderghem centre': { lat: 50.8120, lng: 4.4320 },
  'Observatoire': { lat: 50.7980, lng: 4.3600 },

  // Amsterdam
  'Burgwallen-Oude Zijde': { lat: 52.3718, lng: 4.8980 },
  'Amsterdamse Poort e.o.': { lat: 52.3145, lng: 4.9542 },
  'De Kolenkit': { lat: 52.3785, lng: 4.8480 },
  'Apollobuurt': { lat: 52.3485, lng: 4.8770 },
  'Buitenveldert-West': { lat: 52.3275, lng: 4.8620 },
  'Indische Buurt-Oost': { lat: 52.3650, lng: 4.9380 },
  'Nieuw-West': { lat: 52.3680, lng: 4.8100 },
  'Noord': { lat: 52.3950, lng: 4.9100 },
  'Oost': { lat: 52.3580, lng: 4.9200 },
  'Zuidas': { lat: 52.3380, lng: 4.8720 },

  // Istanbul
  'Fatih': { lat: 41.0182, lng: 28.9437 },
  'Bağcılar': { lat: 41.0401, lng: 28.8475 },
  'Kadıköy': { lat: 40.9910, lng: 29.0270 },
  'Sarıyer': { lat: 41.1680, lng: 29.0550 },
  'Esenyurt': { lat: 41.0340, lng: 28.6800 },
  'Sultanbeyli': { lat: 40.9650, lng: 29.2680 },
  'Ümraniye': { lat: 41.0250, lng: 29.1150 },
  'Şişli': { lat: 41.0590, lng: 28.9850 },
  'Bakırköy': { lat: 40.9800, lng: 28.8750 },
  'Beşiktaş': { lat: 41.0430, lng: 29.0070 },

  // Izmir
  'Konak': { lat: 38.4189, lng: 27.1287 },
  'Buca': { lat: 38.3850, lng: 27.1750 },
  'Karşıyaka': { lat: 38.4590, lng: 27.1100 },
  'Bornova': { lat: 38.4650, lng: 27.2180 },
  'Balçova': { lat: 38.3880, lng: 27.0500 },
  'Karabağlar': { lat: 38.3750, lng: 27.1250 },
  'Menemen': { lat: 38.6050, lng: 27.0680 },
  'Gaziemir': { lat: 38.3250, lng: 27.1350 },
  'Çiğli': { lat: 38.4850, lng: 27.0780 },
  'Çeşme': { lat: 38.3220, lng: 26.3050 },
};

const CITY_CENTERS: Record<City, { lat: number; lng: number; zoom: number }> = {
  Brussels: { lat: 50.8420, lng: 4.3550, zoom: 12 },
  Amsterdam: { lat: 52.3550, lng: 4.8950, zoom: 12 },
  Istanbul: { lat: 41.0350, lng: 28.9500, zoom: 11 },
  Izmir: { lat: 38.4200, lng: 27.1400, zoom: 11 },
};

const scenarios: Record<Scenario, { label: string; heatWeight: number; socialWeight: number; note: string }> = {
  heat: {
    label: 'Technocratic Determinism (70/30)',
    heatWeight: 0.7,
    socialWeight: 0.3,
    note: 'Technocratic Determinism: Physical heat and impervious surfaces take absolute precedence over social inequalities.',
  },
  balanced: {
    label: 'Bureaucratic Compromise (50/50)',
    heatWeight: 0.5,
    socialWeight: 0.5,
    note: 'Bureaucratic Compromise: Artificially splits weight evenly between physical anomalies and human demographics to avoid structural friction.',
  },
  justice: {
    label: 'Radical Spatial Justice (30/70)',
    heatWeight: 0.3,
    socialWeight: 0.7,
    note: 'Radical Spatial Justice: Directs public cooling investments to systemic poverty and isolated elderly populations regardless of sensor dominance.',
  },
};

export const BIVARIATE_MATRIX = [
  ['#8a5e9e', '#ad5482', '#cc3f54'],
  ['#5c8b99', '#8b7d82', '#b86d6a'],
  ['#2a9d8f', '#588a87', '#8c7478'],
];

export function getBivariateColor(heat: number, social: number): string {
  const hIndex = heat < 2.5 ? 0 : heat < 4.0 ? 1 : 2;
  const sIndex = social < 2.5 ? 2 : social < 4.0 ? 1 : 0;
  return BIVARIATE_MATRIX[sIndex][hIndex];
}

const chartConfig = {
  score: { label: 'Priority score', color: '#c2410c' },
} satisfies ChartConfig;

function profileTone(profile: string) {
  if (profile.includes('High heat') || profile.includes('Extreme impervious') || profile.includes('historic core') || profile.includes('central basin')) {
    return 'bg-rose-50 text-rose-800 ring-rose-200 border-rose-200';
  }
  if (profile.includes('Age') || profile.includes('elderly')) {
    return 'bg-amber-50 text-amber-900 ring-amber-200 border-amber-200';
  }
  return 'bg-stone-100 text-stone-800 ring-stone-200 border-stone-200';
}

// ==================== MAYOR GAME TYPES & DATA ====================
type CityKey = 'Brussels' | 'Amsterdam' | 'Istanbul' | 'Izmir';

type DistrictGame = {
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
  districts: DistrictGame[];
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

// ==================== MAIN PAGE COMPONENT ====================
export default function Home() {
  const [data] = useState<Neighbourhood[]>(DATASETS);
  // Default tab is dashboard so it never opens on the black intro page
  const [activeTab, setActiveTab] = useState<'dashboard' | 'methodology' | 'sandbox'>('dashboard');
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');

  // Dashboard Policy Simulator Sliders
  const [heatWeight, setHeatWeight] = useState<number>(34);
  const [ageWeight, setAgeWeight] = useState<number>(33);
  const [incomeWeight, setIncomeWeight] = useState<number>(33);
  const [isCustomWeights, setIsCustomWeights] = useState<boolean>(false);

  // Dashboard What-If Interventions
  const [applyTrees, setApplyTrees] = useState<boolean>(false);
  const [applyShelter, setApplyShelter] = useState<boolean>(false);
  const [applyRetrofit, setApplyRetrofit] = useState<boolean>(false);

  // Mayor Game State
  const [gameScreen, setGameScreen] = useState<'intro' | 'city' | 'game' | 'end'>('intro');
  const [gameCity, setGameCity] = useState<CityKey>('Brussels');
  const [turn, setTurn] = useState(1);
  const [gameStats, setGameStats] = useState<Stats>(BASE_STATS);
  const [eventIndex, setEventIndex] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [lastChoice, setLastChoice] = useState<string | null>(null);

  const currentEvent = turn === 12 ? FINAL_EVENT : EVENTS[eventIndex % EVENTS.length];
  const gameDistricts = CITIES[gameCity].districts;
  const gameDistrict = gameDistricts[selectedDistrict] || gameDistricts[0];

  const weightedRisk = useMemo(() => {
    return gameDistricts
      .map((d) => ({
        ...d,
        score: Math.round(d.heat * 0.5 + d.poverty * 0.25 + d.elderly * 0.15 + d.housing * 0.1),
      }))
      .sort((a, b) => b.score - a.score);
  }, [gameDistricts]);

  const resetGame = () => {
    setGameScreen('intro');
    setGameCity('Brussels');
    setTurn(1);
    setGameStats(BASE_STATS);
    setEventIndex(0);
    setSelectedDistrict(0);
    setGameLog([]);
    setLastChoice(null);
  };

  const startMayorGame = () => {
    setGameScreen('city');
    setGameStats(BASE_STATS);
    setTurn(1);
    setEventIndex(0);
    setGameLog([]);
    setLastChoice(null);
  };

  const chooseGameCity = (next: CityKey) => {
    setGameCity(next);
    setSelectedDistrict(0);
  };

  const applyChoice = (choice: Decision) => {
    const next: Stats = { ...gameStats };

    next.budget -= choice.cost;
    (Object.keys(choice.effect) as Array<keyof Effect>).forEach((key) => {
      if (key === 'months') return;
      const delta = choice.effect[key] ?? 0;
      const statKey = key as keyof Stats;
      next[statKey] = clamp(next[statKey] + delta);
    });

    if (next.heat > 75) next.approval = clamp(next.approval - 2);
    if (next.justice < 35) next.trust = clamp(next.trust - 2);
    if (next.budget < 10) next.council = clamp(next.council - 2);

    setGameStats(next);
    setLastChoice(choice.id);
    setGameLog((old) => [`Turn ${turn}: ${choice.title}`, ...old].slice(0, 6));

    if (turn >= 12 || next.budget < 0) {
      setGameScreen('end');
      return;
    }

    setTurn((t) => t + 1);
    setEventIndex((i) => i + 1);
  };

  const end = endingFor(gameStats);

  // Dashboard Ranking Calculation
  const baselineRanks = useMemo(() => {
    const list = data
      .filter((area) => area.city === city)
      .map((area) => {
        const social = (area.age + area.income) / 2;
        const score = area.heat * 0.7 + social * 0.3;
        return { name: area.name, score };
      })
      .sort((a, b) => b.score - a.score);

    const map: Record<string, number> = {};
    list.forEach((item, index) => {
      map[item.name] = index + 1;
    });
    return map;
  }, [data, city]);

  const ranked = useMemo(() => {
    const filtered = data.filter((area) => area.city === city);
    return filtered
      .map((area) => {
        let effectiveHeat = area.heat;
        let effectiveAge = area.age;
        let effectiveIncome = area.income;

        if (applyTrees) effectiveHeat = Math.max(1, effectiveHeat - 1.0);
        if (applyShelter) effectiveAge = Math.max(1, effectiveAge - 1.2);
        if (applyRetrofit) effectiveIncome = Math.max(1, effectiveIncome - 1.0);

        let calculatedScore = 0;
        if (isCustomWeights) {
          const totalW = (heatWeight + ageWeight + incomeWeight) || 1;
          calculatedScore = ((effectiveHeat * heatWeight) + (effectiveAge * ageWeight) + (effectiveIncome * incomeWeight)) / totalW;
        } else {
          const social = (effectiveAge + effectiveIncome) / 2;
          const rule = scenarios[scenario];
          calculatedScore = effectiveHeat * rule.heatWeight + social * rule.socialWeight;
        }

        const socialAvg = (effectiveAge + effectiveIncome) / 2;

        return {
          ...area,
          effectiveHeat,
          effectiveAge,
          effectiveIncome,
          social: socialAvg,
          bivariateColor: getBivariateColor(effectiveHeat, socialAvg),
          score: calculatedScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((area, index) => {
        const currentRank = index + 1;
        const baseline = baselineRanks[area.name] || currentRank;
        const shift = baseline - currentRank;
        return {
          ...area,
          rank: currentRank,
          baselineRank: baseline,
          rankShift: shift,
        };
      });
  }, [data, city, scenario, isCustomWeights, heatWeight, ageWeight, incomeWeight, baselineRanks, applyTrees, applyShelter, applyRetrofit]);

  const matches = useMemo(() => {
    const cleanQuery = query.trim().toLocaleLowerCase();
    if (!cleanQuery) return [];
    return data.filter((area) => area.name.toLocaleLowerCase().includes(cleanQuery));
  }, [query, data]);

  const top = ranked[0] || {
    name: 'None',
    city,
    heat: 1,
    age: 1,
    income: 1,
    profile: '',
    score: 0,
    rank: 1,
    baselineRank: 1,
    rankShift: 0,
  };

  const rule = scenarios[scenario];

  const radarData = useMemo(() => {
    const cityItems = ranked;
    if (!top || cityItems.length === 0) return [];

    const avgHeat = cityItems.reduce((acc, curr) => acc + curr.heat, 0) / cityItems.length;
    const avgAge = cityItems.reduce((acc, curr) => acc + curr.age, 0) / cityItems.length;
    const avgIncome = cityItems.reduce((acc, curr) => acc + curr.income, 0) / cityItems.length;

    return [
      { metric: 'Thermal Heat', target: top.heat, average: Number(avgHeat.toFixed(2)), fullMark: 5 },
      { metric: 'Elderly (65+)', target: top.age, average: Number(avgAge.toFixed(2)), fullMark: 5 },
      { metric: 'Low Income', target: top.income, average: Number(avgIncome.toFixed(2)), fullMark: 5 },
    ];
  }, [top, ranked]);

  const mapHtml = useMemo(() => {
    const center = CITY_CENTERS[city] || CITY_CENTERS.Brussels;
    const pinsData = ranked.map((item) => ({
      name: item.name,
      lat: item.lat ?? REAL_COORDS[item.name]?.lat ?? center.lat,
      lng: item.lng ?? REAL_COORDS[item.name]?.lng ?? center.lng,
      score: item.score.toFixed(2),
      heat: item.heat.toFixed(2),
      age: item.age.toFixed(2),
      income: item.income.toFixed(2),
      profile: item.profile,
      color: item.bivariateColor,
    }));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin:0; padding:0; height:100%; width:100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map { height: 100%; width: 100%; background: #f8fafc; }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      cursor: pointer;
      transition: transform 0.15s ease-in-out;
    }
    .custom-pin:hover { transform: scale(1.3); }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15,23,42,0.18);
      padding: 4px;
    }
    .popup-title { font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #0f172a; }
    .popup-badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
    .popup-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: 10px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px; }
    .metric-box { text-align: center; }
    .metric-val { font-weight: bold; font-size: 11px; display: block; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${center.lat}, ${center.lng}], ${center.zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const pins = ${JSON.stringify(pinsData)};
    pins.forEach(function(pin) {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="custom-pin" style="background:' + pin.color + '; width:20px; height:20px;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const popupContent = 
        '<div style="min-width: 165px;">' +
          '<div class="popup-title">' + pin.name + '</div>' +
          '<div class="popup-badge" style="background:' + pin.color + '25; color:' + pin.color + '; border: 1px solid ' + pin.color + '60;">Score: ' + pin.score + '</div>' +
          '<div style="font-size:10px; color:#475569; line-height:1.3;">' + pin.profile + '</div>' +
          '<div class="popup-metrics">' +
            '<div class="metric-box"><span style="color:#64748b;">Heat</span><span class="metric-val" style="color:#dc2626;">' + pin.heat + '</span></div>' +
            '<div class="metric-box"><span style="color:#64748b;">Age</span><span class="metric-val" style="color:#d97706;">' + pin.age + '</span></div>' +
            '<div class="metric-box"><span style="color:#64748b;">Income</span><span class="metric-val" style="color:#0284c7;">' + pin.income + '</span></div>' +
          '</div>' +
        '</div>';

      L.marker([pin.lat, pin.lng], { icon: icon }).addTo(map).bindPopup(popupContent);
    });
  </script>
</body>
</html>`;
  }, [ranked, city]);

  const totalSocialWeight = isCustomWeights 
    ? (ageWeight + incomeWeight) 
    : Math.round(rule.socialWeight * 100);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-slate-200">
      {/* ==================== GLOBAL TOP HEADER ==================== */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('methodology')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'methodology'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Methodology & Framework
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-[#c2410c] text-white shadow-md ring-2 ring-orange-400'
                  : 'bg-[#c2410c] text-white hover:bg-[#a9370a] shadow-sm'
              }`}
            >
              <Trophy className="size-3.5" /> Play as Mayor
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-slate-950 p-2 shadow-xs border border-slate-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" fill="#e11d48" />
                <rect x="9.25" y="2" width="5.5" height="5.5" rx="1.5" fill="#f97316" />
                <rect x="16.5" y="2" width="5.5" height="5.5" rx="1.5" fill="#e11d48" />
                <rect x="2" y="9.25" width="5.5" height="5.5" rx="1.5" fill="#f97316" />
                <rect x="9.25" y="9.25" width="5.5" height="5.5" rx="1.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <rect x="16.5" y="9.25" width="5.5" height="5.5" rx="1.5" fill="#fbbf24" />
                <rect x="2" y="16.5" width="5.5" height="5.5" rx="1.5" fill="#e11d48" />
                <rect x="9.25" y="16.5" width="5.5" height="5.5" rx="1.5" fill="#fbbf24" />
                <rect x="16.5" y="16.5" width="5.5" height="5.5" rx="1.5" fill="#e11d48" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-base font-bold tracking-tight text-slate-900 leading-tight">Who Gets Cooled?</p>
              <p className="text-[11px] text-stone-500 font-medium">Critical Data &amp; Urban AI Audit Sandbox</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-stone-500">
              Developed by <strong className="font-semibold text-slate-900">Polen Bicer</strong>
            </span>
            <Badge variant="outline" className="border-stone-300 bg-stone-50 text-slate-700 text-[11px] font-medium">
              4-City Comparative Audit
            </Badge>
          </div>
        </div>
      </header>

      {/* ==================== TAB 1: DASHBOARD ==================== */}
      {activeTab === 'dashboard' ? (
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 md:py-10">
          <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
            <div className="max-w-3xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                <BrainCircuit className="size-4" aria-hidden="true" /> AI Decision-Support Audit
              </p>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950 leading-snug">
                Who Gets Cooled? Auditing Algorithmic Climate Adaptation.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 md:text-base">
                AI does not decide which neighbourhood gets cooled. <strong>Human policymakers choose what data to value</strong>, while the algorithm merely computes the spatial consequences. This interactive sandbox audits how shifting political priorities in Brussels, Amsterdam, Istanbul, and Izmir re-allocate climate resilience resources.
              </p>

              {/* Working Play as Mayor Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('sandbox')}
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white rounded-xl bg-[#c2410c] hover:bg-[#a9370a] shadow-md transition-all text-xs cursor-pointer"
                >
                  <span>👑</span>
                  <span>Play as Mayor: Climate Sandbox</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a neighbourhood or district…"
                aria-label="Search a neighbourhood or district"
                className="h-11 bg-white border-stone-300 pl-10 shadow-xs text-sm rounded-lg focus-visible:ring-slate-900"
              />
              {matches.length > 0 && (
                <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
                  {matches.map((match) => (
                    <button
                      key={`${match.city}-${match.name}`}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium hover:bg-stone-100 cursor-pointer"
                      onClick={() => {
                        setCity(match.city);
                        setQuery('');
                      }}
                    >
                      <span className="text-slate-900 font-semibold">{match.name}</span>
                      <span className="text-stone-500">{match.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* POLICY CONTROL DECK */}
          <section className="mb-8 rounded-2xl border-2 border-slate-900/10 bg-white p-5 md:p-6 shadow-md ring-1 ring-slate-900/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-[#c2410c]">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Interactive Policy Sandbox</h2>
                  <p className="text-xs text-stone-500">Simulate how normative political choices alter automated municipal priorities.</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-stone-200">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Simulation Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  1. Select Urban Context
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                  {(['Brussels', 'Amsterdam', 'Istanbul', 'Izmir'] as City[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        city === c
                          ? 'bg-white text-slate-950 shadow-sm border border-stone-200/60'
                          : 'text-stone-600 hover:text-slate-950'
                      }`}
                    >
                      <Building2 className="size-3 text-slate-700 shrink-0" />
                      <span className="truncate">{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    2. Choose Policy Framework Archetype
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomWeights(!isCustomWeights)}
                    className={`text-[11px] font-bold transition-colors underline underline-offset-4 cursor-pointer ${
                      isCustomWeights ? 'text-[#c2410c]' : 'text-stone-500 hover:text-slate-900'
                    }`}
                  >
                    {isCustomWeights ? '✕ Switch to Presets' : '⚙️ Custom Sliders'}
                  </button>
                </div>

                {!isCustomWeights ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                    {(['heat', 'balanced', 'justice'] as Scenario[]).map((scKey) => {
                      const active = scenario === scKey;
                      const label = 
                        scKey === 'heat' ? 'Technocratic (70/30)' :
                        scKey === 'balanced' ? 'Compromise (50/50)' : 'Spatial Justice (30/70)';
                      
                      const icon = 
                        scKey === 'heat' ? <Flame className="size-3 text-rose-500 inline mr-1 shrink-0" /> :
                        scKey === 'balanced' ? <Scale className="size-3 text-amber-500 inline mr-1 shrink-0" /> :
                        <Users className="size-3 text-sky-500 inline mr-1 shrink-0" />;

                      return (
                        <button
                          key={scKey}
                          type="button"
                          onClick={() => setScenario(scKey)}
                          className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all truncate flex items-center justify-center cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-stone-600 hover:bg-white/60 hover:text-slate-950'
                          }`}
                        >
                          {icon}
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span>Custom Weight Sliders are active below.</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomWeights(false)}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[10px] font-bold cursor-pointer"
                    >
                      Reset to Presets
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Flame className="size-3.5" /> {isCustomWeights ? heatWeight : Math.round(rule.heatWeight * 100)}% Heat Weight
                </span>
                <span className="text-stone-300">|</span>
                <span className="font-bold text-sky-800 flex items-center gap-1">
                  <Users className="size-3.5" /> {totalSocialWeight}% Social Weight
                </span>
              </div>
              <div className="text-stone-600 text-[11px] font-medium flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[#c2410c] shrink-0" />
                <span>
                  {isCustomWeights
                    ? (ageWeight + incomeWeight) > 50
                      ? 'Radical Spatial Justice: Socioeconomic vulnerability and elderly isolation take precedence.'
                      : 'Technocratic Determinism: Physical heat exposure overrides social inequalities.'
                    : rule.note}
                </span>
              </div>
            </div>

            {isCustomWeights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 mt-5 border-t border-stone-200">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="flex items-center gap-1.5 text-stone-800"><Flame className="size-4 text-rose-600" /> Heat Proxy</span>
                    <span className="text-rose-700">{heatWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heatWeight}
                    onChange={(e) => setHeatWeight(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#c2410c]"
                  />
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="flex items-center gap-1.5 text-stone-800"><Users className="size-4 text-amber-600" /> Elderly (65+)</span>
                    <span className="text-amber-700">{ageWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ageWeight}
                    onChange={(e) => setAgeWeight(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#c2410c]"
                  />
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="flex items-center gap-1.5 text-stone-800"><ShieldCheck className="size-4 text-sky-600" /> Low Income</span>
                    <span className="text-sky-700">{incomeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={incomeWeight}
                    onChange={(e) => setIncomeWeight(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#c2410c]"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Ranking & Radar Charts */}
          <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
            <Card className="border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">{city} Priority Ranking</CardTitle>
                    <CardDescription className="text-xs text-stone-500">
                      Rank Shift (up/down) compares current policy to baseline Heat-First rules.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-stone-300 bg-stone-50 text-slate-800 text-xs font-semibold">
                    {isCustomWeights ? 'Custom Weights' : scenarios[scenario].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <ChartContainer config={chartConfig} className="h-[280px] w-full aspect-auto md:h-[320px]">
                  <BarChart data={ranked} layout="vertical" margin={{ left: 8, right: 22, top: 4, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 5]} tickCount={6} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={145} axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 500 }} />
                    <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="score" fill="#c2410c" radius={[0, 6, 6, 0]} barSize={26} />
                  </BarChart>
                </ChartContainer>

                <div className="mt-5 overflow-hidden rounded-lg border border-stone-200">
                  <Table>
                    <TableHeader className="bg-stone-50">
                      <TableRow className="border-stone-200">
                        <TableHead className="w-14 text-xs font-bold text-stone-600">Rank</TableHead>
                        <TableHead className="w-20 text-xs font-bold text-stone-600">Shift</TableHead>
                        <TableHead className="text-xs font-bold text-stone-600">Area</TableHead>
                        <TableHead className="hidden lg:table-cell text-xs font-bold text-stone-600">AI Vulnerability Profile</TableHead>
                        <TableHead className="text-right text-xs font-bold text-stone-600">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranked.map((area) => (
                        <TableRow key={area.name} className="border-stone-100 hover:bg-stone-50/60">
                          <TableCell className="font-mono text-xs text-stone-500 font-semibold">{area.rank}</TableCell>
                          <TableCell>
                            {area.rankShift > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <TrendingUp className="size-3" /> +{area.rankShift}
                              </span>
                            ) : area.rankShift < 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <TrendingDown className="size-3" /> {area.rankShift}
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-400 font-mono pl-1">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 text-xs">{area.name}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium border ${profileTone(area.profile)}`}>
                              {area.profile}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-slate-900 text-xs">{area.score.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-md border border-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Top Priority Target</p>
                    <h3 className="mt-0.5 font-serif text-2xl font-bold">{top.name}</h3>
                    <p className="text-xs text-slate-400">{city} · Score: {top.score ? top.score.toFixed(2) : 'N/A'}</p>
                  </div>
                  <Badge className="bg-amber-400/10 text-amber-300 border-amber-400/20 text-[10px]">Rank #1</Badge>
                </div>

                <div className="mt-3 h-[190px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar name={top.name} dataKey="target" stroke="#c2410c" fill="#c2410c" fillOpacity={0.6} />
                      <Radar name="City Avg" dataKey="average" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    ['Heat Proxy', top.heat, 'text-rose-400'],
                    ['Elderly (65+)', top.age, 'text-amber-400'],
                    ['Low Income', top.income, 'text-sky-400'],
                  ].map(([label, value, colorClass]) => (
                    <div key={String(label)} className="rounded-lg bg-slate-900 p-2 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 truncate">{label}</p>
                      <p className={`font-mono text-sm font-bold ${colorClass}`}>{Number(value).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-[#c2410c]" /> Interventions Simulator
                  </h4>
                  <span className="text-[10px] text-stone-500">Test policy impact on {top.name}</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setApplyTrees(!applyTrees)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      applyTrees
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Flame className={`size-4 ${applyTrees ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>+15% Urban Tree Canopy &amp; Shade</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${applyTrees ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'text-stone-500'}`}>
                      -1.0 Heat
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyShelter(!applyShelter)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      applyShelter
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className={`size-4 ${applyShelter ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span>Cooling Shelter &amp; Water Network</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${applyShelter ? 'bg-amber-100 border-amber-300 text-amber-800' : 'text-stone-500'}`}>
                      -1.2 Age Risk
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyRetrofit(!applyRetrofit)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      applyRetrofit
                        ? 'bg-sky-50 border-sky-300 text-sky-950 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className={`size-4 ${applyRetrofit ? 'text-sky-600' : 'text-stone-400'}`} />
                      <span>Social Housing Thermal Retrofit</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${applyRetrofit ? 'bg-sky-100 border-sky-300 text-sky-800' : 'text-stone-500'}`}>
                      -1.0 Poverty Risk
                    </Badge>
                  </button>
                </div>

                {(applyTrees || applyShelter || applyRetrofit) && (
                  <button
                    type="button"
                    onClick={() => {
                      setApplyTrees(false);
                      setApplyShelter(false);
                      setApplyRetrofit(false);
                    }}
                    className="mt-3 w-full py-1.5 text-[11px] text-stone-500 hover:text-slate-900 flex items-center justify-center gap-1 border-t border-stone-100 cursor-pointer"
                  >
                    <RefreshCw className="size-3" /> Reset Interventions
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Leaflet Bivariate Map */}
          <div className="p-5 mb-8 rounded-2xl border border-stone-200 bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="size-4 text-[#c2410c]" /> Spatial Exposure and Bivariate Risk Map ({city})
                </h3>
                <p className="text-xs text-stone-500">Real geographic map showing 2D intersection of Thermal Heat and Socioeconomic Vulnerability.</p>
              </div>
            </div>

            <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-stone-200 shadow-inner">
              <iframe
                title="Geographic Risk Map"
                srcDoc={mapHtml}
                className="w-full h-full border-0"
              />

              <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-2xl text-slate-200 text-xs w-52 select-none">
                <div className="font-semibold text-slate-100 mb-2 flex items-center justify-between text-[11px]">
                  <span>2D Risk Matrix</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">Bivariate</span>
                </div>

                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute -left-3.5 text-[9px] font-medium text-slate-400 -rotate-90 origin-center whitespace-nowrap">
                    Social Risk →
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-md border border-slate-800">
                    {BIVARIATE_MATRIX.map((row, rIdx) =>
                      row.map((color, cIdx) => {
                        const isCritical = rIdx === 0 && cIdx === 2;
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-xs transition-transform hover:scale-110 flex items-center justify-center ${
                              isCritical ? 'ring-1 ring-white shadow-xs' : ''
                            }`}
                            title={
                              isCritical
                                ? 'Critical Intersection: High Heat + High Social Vulnerability'
                                : rIdx === 2 && cIdx === 0
                                ? 'Lower Baseline Risk'
                                : 'Moderate / Combined Risk'
                            }
                          >
                            {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="text-center text-[9px] font-medium text-slate-400 mt-1">
                  Surface Heat (LST) →
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/90 flex items-center justify-between text-[9px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#2a9d8f]" />
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#cc3f54]" />
                    <span className="text-rose-400 font-bold">Highest Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'sandbox' ? (
        /* ==================== TAB 2: MAYOR GAME (WHO GETS COOLED?) ==================== */
        <div className="py-4">
          {gameScreen === 'intro' ? (
            <div className="min-h-[80vh] bg-[#0d1117] text-white flex items-center px-6 py-12 rounded-3xl mx-4 my-2 border border-slate-800 shadow-2xl">
              <div className="mx-auto max-w-6xl grid w-full gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
                <section>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back to Data Dashboard
                  </button>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] text-orange-300">
                    <BrainCircuit className="size-3.5" /> Urban AI Governance Game
                  </div>
                  <h1 className="max-w-3xl font-serif text-5xl font-black leading-[.98] tracking-tight md:text-7xl">
                    WHO GETS <br /><span className="text-[#c2410c]">COOLED?</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                    You are the mayor. A heatwave is coming. Your budget is finite, your citizens disagree, and your algorithm is not neutral. Protect the city — and survive the politics.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold">
                    {['12 turns', '4 cities', '20+ decisions', 'Multiple endings'].map((x) => (
                      <span key={x} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">{x}</span>
                    ))}
                  </div>
                  <button
                    onClick={startMayorGame}
                    className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-950/30 transition hover:bg-[#a9370a] cursor-pointer"
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
          ) : gameScreen === 'city' ? (
            <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-[.18em] text-[#c2410c]">Step 01 · Choose your city</span>
                <h1 className="mt-2 font-serif text-4xl font-black md:text-5xl">Every city has a different political problem.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">The rules are shared, but the pressure points are not. Choose where you want to govern.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(Object.keys(CITIES) as CityKey[]).map((key) => {
                  const c = CITIES[key];
                  const active = gameCity === key;
                  return (
                    <button
                      key={key}
                      onClick={() => chooseGameCity(key)}
                      className={`group rounded-2xl border p-6 text-left transition cursor-pointer ${
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
                  <p className="mt-1 font-serif text-xl font-bold">{CITIES[gameCity].emoji} {gameCity}</p>
                </div>
                <button 
                  onClick={() => setGameScreen('game')} 
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white hover:bg-[#c2410c] cursor-pointer transition-colors"
                >
                  TAKE OFFICE <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : gameScreen === 'end' ? (
            <div className="min-h-[80vh] bg-[#0d1117] px-5 py-10 text-white rounded-3xl mx-4 my-2 border border-slate-800">
              <div className="mx-auto max-w-5xl">
                <div className={`rounded-3xl border p-8 md:p-12 ${end.type === 'WIN' ? 'border-orange-400/20 bg-orange-400/[.04]' : 'border-red-400/20 bg-red-400/[.04]'}`}>
                  <div className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
                    {end.type === 'WIN' ? '12 turns completed · Election result' : 'Administration concluded'}
                  </div>
                  <h1 className="mt-3 max-w-4xl font-serif text-5xl font-black md:text-7xl">{end.title}</h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{end.text}</p>

                  <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['🌡️', 'Heat risk', gameStats.heat, gameStats.heat <= 48],
                      ['⚖️', 'Justice', gameStats.justice, gameStats.justice >= 68],
                      ['👍', 'Approval', gameStats.approval, gameStats.approval >= 65],
                      ['🤝', 'Trust', gameStats.trust, gameStats.trust >= 65],
                      ['🏛️', 'Council', gameStats.council, gameStats.council >= 50],
                      ['🏥', 'Health', gameStats.health, gameStats.health >= 65],
                      ['🌳', 'Green', gameStats.green, gameStats.green >= 50],
                      ['💶', 'Budget', money(gameStats.budget), gameStats.budget >= 5],
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
                        {gameLog.slice().reverse().map((item) => (
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
                        A different weighting of climate, social vulnerability and political capital would have produced a different city.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={resetGame} 
                      className="inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-3 text-xs font-black hover:bg-[#a9370a] cursor-pointer text-white"
                    >
                      PLAY AGAIN <Sparkles className="size-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('dashboard')} 
                      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-xs font-black hover:bg-white/20 cursor-pointer text-white"
                    >
                      EXIT TO DASHBOARD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[1500px] px-4 py-5 md:px-6">
              <div className="mb-4 flex items-center justify-between bg-white border border-stone-200 p-3.5 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-slate-950 text-base">👑</div>
                  <div>
                    <div className="font-serif text-sm font-black tracking-tight">{CITIES[gameCity].emoji} {gameCity} · MAYOR EXECUTIVE MODE</div>
                    <div className="text-[10px] font-semibold text-stone-400">Turn {turn} / 12 · City Council in Session</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-black font-mono text-white">{money(gameStats.budget)} remaining</span>
                  <button onClick={() => setActiveTab('dashboard')} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer">
                    Exit Game
                  </button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
                <aside className="space-y-4">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">City pulse</span>
                      <BarChart3 className="size-4 text-[#c2410c]" />
                    </div>
                    <div className="space-y-4">
                      <StatBar label="Heat risk" value={gameStats.heat} icon={<Zap className="size-3 text-red-500" />} />
                      <StatBar label="Spatial justice" value={gameStats.justice} icon={<Scale className="size-3 text-blue-500" />} />
                      <StatBar label="Public approval" value={gameStats.approval} icon={<Users className="size-3 text-emerald-500" />} />
                      <StatBar label="Citizen trust" value={gameStats.trust} icon={<HeartPulse className="size-3 text-pink-500" />} />
                      <StatBar label="Council support" value={gameStats.council} icon={<Gavel className="size-3 text-violet-500" />} />
                      <StatBar label="Green coverage" value={gameStats.green} icon={<Leaf className="size-3 text-green-600" />} />
                      <StatBar label="Health capacity" value={gameStats.health} icon={<ShieldAlert className="size-3 text-cyan-600" />} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-slate-950 p-4 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold"><Coins className="size-4 text-orange-300" /> Budget office</div>
                    <div className="mt-2 font-mono text-3xl font-black">{money(gameStats.budget)}</div>
                    <div className="mt-2 text-[10px] leading-4 text-slate-400">Spend now, pay later — or preserve fiscal room for the next crisis.</div>
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
                    {gameDistricts.map((d, i) => {
                      const selected = i === selectedDistrict;
                      const risk = Math.round(d.heat * .6 + d.poverty * .25 + d.elderly * .15);
                      const size = 40 + Math.round(risk * .35);
                      return (
                        <button
                          key={d.name}
                          onClick={() => setSelectedDistrict(i)}
                          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-xl transition hover:scale-110 cursor-pointer ${selected ? 'ring-4 ring-orange-400/60' : ''}`}
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
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#c2410c]">Selected district</div>
                        <h2 className="mt-1 font-serif text-2xl font-black">{gameDistrict.name}</h2>
                        <p className="mt-1 text-xs text-stone-500">AI priority score: <b>{weightedRisk.find((x) => x.name === gameDistrict.name)?.score}</b> / 100</p>
                      </div>
                      <span className="rounded-lg bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-500">CLICK A MAP PIN</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {[
                        ['Heat', gameDistrict.heat],
                        ['Poverty', gameDistrict.poverty],
                        ['Elderly', gameDistrict.elderly],
                        ['Housing', gameDistrict.housing],
                        ['Green', gameDistrict.green],
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
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#c2410c]">
                      <Sparkles className="size-4" /> {currentEvent.kicker}
                    </div>
                    <h2 className="mt-3 font-serif text-2xl font-black leading-tight">{currentEvent.title}</h2>
                    <p className="mt-3 text-xs leading-5 text-stone-600">{currentEvent.body}</p>

                    <div className="mt-5 space-y-2">
                      {currentEvent.choices.map((choice) => {
                        const disabled = choice.cost > gameStats.budget;
                        const selected = lastChoice === choice.id && turn > 1;
                        return (
                          <button
                            key={choice.id}
                            disabled={disabled}
                            onClick={() => applyChoice(choice)}
                            className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${
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
                                <span className="mt-2 inline-block rounded bg-white px-1.5 py-0.5 text-[8px] font-black tracking-wider text-stone-400">{choice.tag}</span>
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
                      {gameLog.length === 0 ? (
                        <p className="text-xs text-stone-400">Your first decision will appear here.</p>
                      ) : (
                        gameLog.map((item) => (
                          <div key={item} className="flex gap-2 text-[10px] leading-4 text-stone-600">
                            <Check className="mt-0.5 size-3 shrink-0 text-emerald-600" /> {item}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== TAB 3: METHODOLOGY ==================== */
        <div className="mx-auto max-w-[1240px] px-5 py-10 md:px-8">
          <div className="mb-10 text-center md:text-left">
            <Badge variant="outline" className="mb-3 border-stone-300 bg-stone-100 text-stone-700 text-xs font-medium">
              Academic and Analytical Blueprint
            </Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-950">
              Methodology and Theoretical Framework
            </h2>
            <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
              This research prototype investigates the algorithmic governance of urban climate adaptation across four metropolises: Brussels, Amsterdam, Istanbul, and Izmir. By auditing socio-spatial trade-offs, it examines whether data modeling advances or undermines environmental justice.
            </p>
          </div>

          <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#c2410c] mb-2 flex items-center gap-2">
              <Compass className="size-4" /> IPCC Climate Risk Operationalisation
            </h3>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center my-3">
              <p className="font-mono text-sm md:text-base font-bold text-slate-900">
                Urban Heat Priority Score = (w_heat * Heat Proxy) + [w_social * ((Age 65+ + Income Vulnerability) / 2)]
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Grounded in the IPCC Risk Framework (Risk = Hazard * Exposure * Vulnerability), the model converts raw administrative data into standardised 1-5 relative scores within each city. The weights (w) are not mathematical truths—they represent <strong>normative political choices</strong> made by human decision-makers.
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-[#c2410c]" /> 1. Data Operationalisation and Indicator Rationale
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
              Algorithmic scoring models are never neutral; the choice of indicators defines what the municipal bureaucracy sees and what it ignores. Our dataset operationalises three foundational dimensions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Flame className="size-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Thermal Risk Proxy (1-5)</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Operational Definition:</strong> Composite indicator based on Land Surface Temperature (LST) anomalies and high soil imperviousness.
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 border-t border-stone-100 pt-2 italic">
                  <strong>Why it matters:</strong> Densely built urban fabrics create severe Urban Heat Islands (UHI), preventing nocturnal cooling.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Users className="size-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Age Vulnerability (65+)</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Operational Definition:</strong> Proportion of residents aged 65 and above, weighted by single-person household density from municipal registries.
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 border-t border-stone-100 pt-2 italic">
                  <strong>Why it matters:</strong> Physiological thermoregulation decline makes elderly residents the primary demographic for heat-wave mortality.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                    <ShieldAlert className="size-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Income Vulnerability</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Operational Definition:</strong> Standardised inverse of median household disposable income and low-income subsidy dependency rate.
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 border-t border-stone-100 pt-2 italic">
                  <strong>Why it matters:</strong> Low-income households face severe thermal energy poverty and reside in poorly insulated housing stock.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <Scale className="size-5 text-[#c2410c]" /> 2. Environmental and Spatial Justice Triad
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
              Following David Schlosberg and Gordon Walker, environmental justice in municipal climate adaptation requires examining three interrelated dimensions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">DISTRIBUTIVE</span>
                  <h4 className="font-bold text-sm text-slate-900">Distributive Justice</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Spatial Resource Allocation</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Who gets public shade, tree canopies, and cooling shelters? Audits whether cooling investments flow disproportionately to affluent areas or protect marginalized spaces.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-50">PROCEDURAL</span>
                  <h4 className="font-bold text-sm text-slate-900">Procedural Justice</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Democratic and Algorithmic Oversight</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Who controls the model parameters? Ensures transparent algorithmic scoring where citizen deliberation and public officials audit automated allocation rules.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-sky-700 px-2 py-0.5 rounded bg-sky-50">RECOGNITION</span>
                  <h4 className="font-bold text-sm text-slate-900">Justice as Recognition</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Demographic and Lived Vulnerability</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Are vulnerable populations recognized by the data? Pure satellite thermal indices often erase informal housing and elderly isolation unless social data is explicitly recognized.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
