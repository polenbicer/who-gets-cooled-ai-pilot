'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Compass,
  FileSpreadsheet,
  Flame,
  Globe,
  Info,
  Layers,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trees,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
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

type City = 'Brussels' | 'Amsterdam' | 'Istanbul' | 'Izmir';
type Scenario = 'heat' | 'balanced' | 'justice' | 'green';

type Neighbourhood = {
  city: City;
  name: string;
  heat: number;
  age: number;
  income: number;
  canopyDeficit: number;
  profile: string;
  lat?: number;
  lng?: number;
};

const DATASETS: Neighbourhood[] = [
  // Brussels (5)
  { city: 'Brussels', name: 'Marolles', heat: 4.79, age: 2.26, income: 4.87, canopyDeficit: 4.80, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Molenbeek Historique', heat: 4.77, age: 1.54, income: 5.00, canopyDeficit: 4.90, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Cureghem Bara', heat: 5.00, age: 1.00, income: 4.95, canopyDeficit: 4.95, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Châtelain', heat: 4.23, age: 1.35, income: 2.56, canopyDeficit: 3.40, profile: 'High heat + moderate canopy deficit' },
  { city: 'Brussels', name: "Vivier d'Oie", heat: 1.00, age: 5.00, income: 1.00, canopyDeficit: 1.10, profile: 'Age vulnerability + forested buffer' },

  // Amsterdam (5)
  { city: 'Amsterdam', name: 'Burgwallen-Oude Zijde', heat: 5.00, age: 1.89, income: 4.90, canopyDeficit: 4.85, profile: 'High heat + income vulnerability' },
  { city: 'Amsterdam', name: 'Amsterdamse Poort e.o.', heat: 1.17, age: 1.00, income: 5.00, canopyDeficit: 2.20, profile: 'Income vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'De Kolenkit', heat: 1.46, age: 1.30, income: 4.62, canopyDeficit: 3.10, profile: 'Income vulnerability + moderate canopy deficit' },
  { city: 'Amsterdam', name: 'Apollobuurt', heat: 2.08, age: 4.23, income: 1.00, canopyDeficit: 1.60, profile: 'Age vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'Buitenveldert-West', heat: 1.00, age: 5.00, income: 3.97, canopyDeficit: 1.20, profile: 'Age vulnerability + high green cover' },

  // Istanbul (5)
  { city: 'Istanbul', name: 'Fatih', heat: 4.85, age: 3.80, income: 4.70, canopyDeficit: 4.90, profile: 'High density historic core + socioeconomic vulnerability' },
  { city: 'Istanbul', name: 'Bağcılar', heat: 5.00, age: 1.20, income: 5.00, canopyDeficit: 5.00, profile: 'Extreme impervious surface + low income vulnerability' },
  { city: 'Istanbul', name: 'Kadıköy', heat: 3.40, age: 5.00, income: 1.20, canopyDeficit: 2.80, profile: 'High age vulnerability + coastal heat exposure' },
  { city: 'Istanbul', name: 'Sarıyer', heat: 1.00, age: 2.60, income: 1.00, canopyDeficit: 1.00, profile: 'Northern green corridor + lower thermal risk' },
  { city: 'Istanbul', name: 'Esenyurt', heat: 4.50, age: 1.00, income: 4.80, canopyDeficit: 4.60, profile: 'High residential mass + income vulnerability' },

  // Izmir (5)
  { city: 'Izmir', name: 'Konak', heat: 4.90, age: 3.60, income: 4.80, canopyDeficit: 4.70, profile: 'Historic central basin + severe UHI & income vulnerability' },
  { city: 'Izmir', name: 'Buca', heat: 4.70, age: 2.10, income: 4.20, canopyDeficit: 4.50, profile: 'Dense urban fabric + moderate-to-low income vulnerability' },
  { city: 'Izmir', name: 'Karşıyaka', heat: 3.20, age: 5.00, income: 1.40, canopyDeficit: 2.40, profile: 'High elderly demographic vulnerability + coastal exposure' },
  { city: 'Izmir', name: 'Bornova', heat: 4.20, age: 2.50, income: 3.60, canopyDeficit: 3.50, profile: 'Inland plain thermal accumulation + mixed profile' },
  { city: 'Izmir', name: 'Balçova', heat: 1.00, age: 4.10, income: 1.60, canopyDeficit: 1.30, profile: 'Thermal/green microclimate buffer + lower physical heat' },
];

const REAL_COORDS: Record<string, { lat: number; lng: number }> = {
  // Brussels
  'Marolles': { lat: 50.8385, lng: 4.3468 },
  'Molenbeek Historique': { lat: 50.8546, lng: 4.3340 },
  'Cureghem Bara': { lat: 50.8402, lng: 4.3308 },
  'Châtelain': { lat: 50.8242, lng: 4.3601 },
  "Vivier d'Oie": { lat: 50.7892, lng: 4.3755 },

  // Amsterdam
  'Burgwallen-Oude Zijde': { lat: 52.3718, lng: 4.8980 },
  'Amsterdamse Poort e.o.': { lat: 52.3145, lng: 4.9542 },
  'De Kolenkit': { lat: 52.3785, lng: 4.8480 },
  'Apollobuurt': { lat: 52.3485, lng: 4.8770 },
  'Buitenveldert-West': { lat: 52.3275, lng: 4.8620 },

  // Istanbul
  'Fatih': { lat: 41.0182, lng: 28.9437 },
  'Bağcılar': { lat: 41.0401, lng: 28.8475 },
  'Kadıköy': { lat: 40.9910, lng: 29.0270 },
  'Sarıyer': { lat: 41.1680, lng: 29.0550 },
  'Esenyurt': { lat: 41.0340, lng: 28.6800 },

  // Izmir
  'Konak': { lat: 38.4189, lng: 27.1287 },
  'Buca': { lat: 38.3850, lng: 27.1750 },
  'Karşıyaka': { lat: 38.4590, lng: 27.1100 },
  'Bornova': { lat: 38.4650, lng: 27.2180 },
  'Balçova': { lat: 38.3880, lng: 27.0500 },
};

const CITY_CENTERS: Record<City, { lat: number; lng: number; zoom: number }> = {
  Brussels: { lat: 50.8420, lng: 4.3550, zoom: 12 },
  Amsterdam: { lat: 52.3550, lng: 4.8950, zoom: 12 },
  Istanbul: { lat: 41.0350, lng: 28.9500, zoom: 11 },
  Izmir: { lat: 38.4200, lng: 27.1400, zoom: 11 },
};

const scenarios: Record<Scenario, { 
  label: string; 
  heatWeight: number; 
  ageWeight: number; 
  incomeWeight: number; 
  canopyWeight: number; 
  note: string 
}> = {
  heat: { 
    label: 'Heat-First (60/15/15/10)', 
    heatWeight: 60, 
    ageWeight: 15, 
    incomeWeight: 15, 
    canopyWeight: 10, 
    note: 'Prioritises physical heat exposure and surface temperature anomalies.' 
  },
  balanced: { 
    label: 'Balanced (35/25/25/15)', 
    heatWeight: 35, 
    ageWeight: 25, 
    incomeWeight: 25, 
    canopyWeight: 15, 
    note: 'Gives equitable weight across thermal exposure, demographics, and canopy access.' 
  },
  justice: { 
    label: 'Justice-First (20/35/35/10)', 
    heatWeight: 20, 
    ageWeight: 35, 
    incomeWeight: 35, 
    canopyWeight: 10, 
    note: 'Prioritises socio-economic inequality and elderly isolation in cooling allocation.' 
  },
  green: { 
    label: 'Canopy-Deficit (20/15/15/50)', 
    heatWeight: 20, 
    ageWeight: 15, 
    incomeWeight: 15, 
    canopyWeight: 50, 
    note: 'Focuses climate adaptation funds directly on urban areas with severe lack of tree canopy & shade.' 
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

export default function Home() {
  const [data] = useState<Neighbourhood[]>(DATASETS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'methodology'>('dashboard');
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');

  // Policy Simulator
  const [heatWeight, setHeatWeight] = useState<number>(30);
  const [ageWeight, setAgeWeight] = useState<number>(25);
  const [incomeWeight, setIncomeWeight] = useState<number>(25);
  const [canopyWeight, setCanopyWeight] = useState<number>(20);
  const [isCustomWeights, setIsCustomWeights] = useState<boolean>(false);

  // What-If Interventions
  const [applyTrees, setApplyTrees] = useState<boolean>(false);
  const [applyShelter, setApplyShelter] = useState<boolean>(false);
  const [applyRetrofit, setApplyRetrofit] = useState<boolean>(false);

  const baselineRanks = useMemo(() => {
    const list = data
      .filter((area) => area.city === city)
      .map((area) => {
        const social = (area.age + area.income) / 2;
        const score = (area.heat * 0.6) + (social * 0.3) + (area.canopyDeficit * 0.1);
        return { name: area.name, score };
      })
      .sort((a, b) => b.score - a.score);

    const map: Record<string, number> = {};
    list.forEach((item, index) => {
      map[item.name] = index + 1;
    });
    return map;
  }, [data, city]);

  const currentWeights = useMemo(() => {
    if (isCustomWeights) {
      return { heat: heatWeight, age: ageWeight, income: incomeWeight, canopy: canopyWeight };
    }
    const s = scenarios[scenario];
    return { heat: s.heatWeight, age: s.ageWeight, income: s.incomeWeight, canopy: s.canopyWeight };
  }, [isCustomWeights, heatWeight, ageWeight, incomeWeight, canopyWeight, scenario]);

  const ranked = useMemo(() => {
    const filtered = data.filter((area) => area.city === city);
    const totalW = (currentWeights.heat + currentWeights.age + currentWeights.income + currentWeights.canopy) || 1;

    return filtered
      .map((area) => {
        let effectiveHeat = area.heat;
        let effectiveAge = area.age;
        let effectiveIncome = area.income;
        let effectiveCanopyDeficit = area.canopyDeficit;

        if (applyTrees) {
          effectiveHeat = Math.max(1, effectiveHeat - 1.0);
          effectiveCanopyDeficit = Math.max(1, effectiveCanopyDeficit - 1.5);
        }
        if (applyShelter) effectiveAge = Math.max(1, effectiveAge - 1.2);
        if (applyRetrofit) effectiveIncome = Math.max(1, effectiveIncome - 1.0);

        const calculatedScore = (
          (effectiveHeat * currentWeights.heat) +
          (effectiveAge * currentWeights.age) +
          (effectiveIncome * currentWeights.income) +
          (effectiveCanopyDeficit * currentWeights.canopy)
        ) / totalW;

        const socialAvg = (effectiveAge + effectiveIncome) / 2;

        return {
          ...area,
          effectiveHeat,
          effectiveAge,
          effectiveIncome,
          effectiveCanopyDeficit,
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
  }, [data, city, currentWeights, baselineRanks, applyTrees, applyShelter, applyRetrofit]);

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
    canopyDeficit: 1,
    profile: '',
    score: 0,
    rank: 1,
    baselineRank: 1,
    rankShift: 0,
  };

  const radarData = useMemo(() => {
    const cityItems = ranked;
    if (!top || cityItems.length === 0) return [];

    const avgHeat = cityItems.reduce((acc, curr) => acc + curr.heat, 0) / cityItems.length;
    const avgAge = cityItems.reduce((acc, curr) => acc + curr.age, 0) / cityItems.length;
    const avgIncome = cityItems.reduce((acc, curr) => acc + curr.income, 0) / cityItems.length;
    const avgCanopy = cityItems.reduce((acc, curr) => acc + curr.canopyDeficit, 0) / cityItems.length;

    return [
      { metric: 'Thermal Heat', target: top.heat, average: Number(avgHeat.toFixed(2)), fullMark: 5 },
      { metric: 'Elderly (65+)', target: top.age, average: Number(avgAge.toFixed(2)), fullMark: 5 },
      { metric: 'Low Income', target: top.income, average: Number(avgIncome.toFixed(2)), fullMark: 5 },
      { metric: 'Canopy Deficit', target: top.canopyDeficit, average: Number(avgCanopy.toFixed(2)), fullMark: 5 },
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
      canopy: item.canopyDeficit.toFixed(2),
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
    .popup-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; font-size: 10px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px; }
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
        '<div style="min-width: 175px;">' +
          '<div class="popup-title">' + pin.name + '</div>' +
          '<div class="popup-badge" style="background:' + pin.color + '25; color:' + pin.color + '; border: 1px solid ' + pin.color + '60;">Score: ' + pin.score + '</div>' +
          '<div style="font-size:10px; color:#475569; line-height:1.3;">' + pin.profile + '</div>' +
          '<div class="popup-metrics">' +
            '<div class="metric-box"><span style="color:#64748b;">Heat</span><span class="metric-val" style="color:#dc2626;">' + pin.heat + '</span></div>' +
            '<div class="metric-box"><span style="color:#64748b;">Age</span><span class="metric-val" style="color:#d97706;">' + pin.age + '</span></div>' +
            '<div class="metric-box"><span style="color:#64748b;">Income</span><span class="metric-val" style="color:#0284c7;">' + pin.income + '</span></div>' +
            '<div class="metric-box"><span style="color:#64748b;">Canopy</span><span class="metric-val" style="color:#059669;">' + pin.canopy + '</span></div>' +
          '</div>' +
        '</div>';

      L.marker([pin.lat, pin.lng], { icon: icon })
        .addTo(map)
        .bindPopup(popupContent);
    });
  </script>
</body>
</html>`;
  }, [ranked, city]);

  const totalSocialWeight = isCustomWeights 
    ? (ageWeight + incomeWeight) 
    : (scenarios[scenario].ageWeight + scenarios[scenario].incomeWeight);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-slate-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
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
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'methodology'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Methodology & Framework
            </button>
          </div>

          {/* Brand Logo & Subtitle */}
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

      {activeTab === 'dashboard' ? (
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 md:py-10">
          {/* Hero Section */}
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
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium hover:bg-stone-100"
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

            {/* City Selector & Presets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* City Switcher */}
              <div className="lg:col-span-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  1. Select Urban Context
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                  {(['Brussels', 'Amsterdam', 'Istanbul', 'Izmir'] as City[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
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

              {/* Policy Rule Preset Selector (4 Presets) */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    2. Choose Policy Framework Archetype
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomWeights(!isCustomWeights)}
                    className={`text-[11px] font-bold transition-colors underline underline-offset-4 ${
                      isCustomWeights ? 'text-[#c2410c]' : 'text-stone-500 hover:text-slate-900'
                    }`}
                  >
                    {isCustomWeights ? '✕ Switch to Presets' : '⚙️ Custom Sliders'}
                  </button>
                </div>

                {!isCustomWeights ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                    {(['heat', 'balanced', 'justice', 'green'] as Scenario[]).map((scKey) => {
                      const active = scenario === scKey;
                      const label = 
                        scKey === 'heat' ? 'Heat-First' :
                        scKey === 'balanced' ? 'Balanced' :
                        scKey === 'justice' ? 'Justice-First' : 'Canopy-Deficit';
                      
                      const icon = 
                        scKey === 'heat' ? <Flame className="size-3 text-rose-500 inline mr-1" /> :
                        scKey === 'balanced' ? <Scale className="size-3 text-amber-500 inline mr-1" /> :
                        scKey === 'justice' ? <Users className="size-3 text-sky-500 inline mr-1" /> :
                        <Trees className="size-3 text-emerald-500 inline mr-1" />;

                      return (
                        <button
                          key={scKey}
                          type="button"
                          onClick={() => setScenario(scKey)}
                          className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all truncate flex items-center justify-center ${
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
                      className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-[10px] font-bold"
                    >
                      Reset to Presets
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Political Shift Insight Banner */}
            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Flame className="size-3.5" /> {currentWeights.heat}% Heat
                </span>
                <span className="text-stone-300">|</span>
                <span className="font-bold text-sky-800 flex items-center gap-1">
                  <Users className="size-3.5" /> {totalSocialWeight}% Social
                </span>
                <span className="text-stone-300">|</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Trees className="size-3.5" /> {currentWeights.canopy}% Canopy Deficit
                </span>
              </div>
              <div className="text-stone-600 text-[11px] font-medium flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[#c2410c] shrink-0" />
                <span>
                  {scenario === 'green' || (isCustomWeights && canopyWeight > 35)
                    ? 'Canopy-Deficit Prioritised: Severely treeless and paved sectors take priority.'
                    : scenario === 'justice' || (isCustomWeights && totalSocialWeight > 50)
                    ? 'Social Justice Prioritised: Vulnerable demographics move up despite lower surface heat.'
                    : 'Physical Heat Prioritised: Dense urban surfaces take precedence over social inequality.'}
                </span>
              </div>
            </div>

            {/* Custom Sliders */}
            {isCustomWeights && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 mt-5 border-t border-stone-200">
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

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="flex items-center gap-1.5 text-stone-800"><Trees className="size-4 text-emerald-600" /> Canopy Deficit</span>
                    <span className="text-emerald-700">{canopyWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={canopyWeight}
                    onChange={(e) => setCanopyWeight(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            )}
          </section>

          {/* 1. SECTION: Priority Ranking & Top Priority Target */}
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

            {/* Target Card with 4-Axis Radar Chart */}
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

                <div className="mt-3 h-[200px] w-full flex items-center justify-center">
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

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[
                    ['Heat', top.heat, 'text-rose-400'],
                    ['Elderly', top.age, 'text-amber-400'],
                    ['Income', top.income, 'text-sky-400'],
                    ['Canopy Deficit', top.canopyDeficit, 'text-emerald-400'],
                  ].map(([label, value, colorClass]) => (
                    <div key={String(label)} className="rounded-lg bg-slate-900 p-2 border border-slate-800 text-center">
                      <p className="text-[9px] text-slate-400 truncate">{label}</p>
                      <p className={`font-mono text-xs font-bold ${colorClass}`}>{Number(value).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interventions Simulator */}
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                      applyTrees
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Trees className={`size-4 ${applyTrees ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>+15% Urban Tree Canopy</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${applyTrees ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'text-stone-500'}`}>
                      -1.0 Heat / -1.5 Deficit
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyShelter(!applyShelter)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                      applyShelter
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className={`size-4 ${applyShelter ? 'text-amber-600' : 'text-stone-400'}`} />
                      <span>Cooling Shelter & Water Network</span>
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${applyShelter ? 'bg-amber-100 border-amber-300 text-amber-800' : 'text-stone-500'}`}>
                      -1.2 Age Risk
                    </Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyRetrofit(!applyRetrofit)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
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
                    className="mt-3 w-full py-1.5 text-[11px] text-stone-500 hover:text-slate-900 flex items-center justify-center gap-1 border-t border-stone-100"
                  >
                    <RefreshCw className="size-3" /> Reset Interventions
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 2. SECTION: OpenStreetMap with Bivariate 2D Matrix Legend */}
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

              {/* Bivariate 3x3 Legend Overlay */}
              <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-2xl text-slate-200 text-xs w-52 select-none">
                <div className="font-semibold text-slate-100 mb-2 flex items-center justify-between text-[11px]">
                  <span>2D Risk Matrix</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">Bivariate</span>
                </div>

                <div className="relative flex items-center justify-center py-1">
                  {/* Y-Axis Label */}
                  <div className="absolute -left-3.5 text-[9px] font-medium text-slate-400 -rotate-90 origin-center whitespace-nowrap">
                    Social Risk →
                  </div>

                  {/* 3x3 Grid */}
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

                {/* X-Axis Label */}
                <div className="text-center text-[9px] font-medium text-slate-400 mt-1">
                  Surface Heat (LST) →
                </div>

                {/* Legend Footnotes */}
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

          {/* 3. SECTION: Bottom Conceptual & Methodological Summary */}
          <section className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <Card className="border border-stone-200 bg-white shadow-xs h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Info className="size-4 text-[#c2410c]" /> Where AI Enters Decision-Making
                  </CardTitle>
                  <CardDescription className="text-xs text-stone-500">The model structures allocation evidence; democratic oversight decides.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 pt-1">
                  {[
                    ['Public Data Ingestion', 'Satellite thermal indices, tree canopy coverage, census registries'],
                    ['Algorithmic Profiling', 'Pattern clustering identifies overlapping vulnerability types'],
                    ['Human Policy Weights', 'Elected officials select normative weighting priorities'],
                    ['Democratic Legitimacy', 'Citizen deliberation remains the final decisive arbiter'],
                  ].map(([title, description], index) => (
                    <div key={title} className="flex gap-3 items-center">
                      <div className="grid size-6 shrink-0 place-items-center rounded-md bg-stone-100 font-mono text-xs font-bold text-slate-900">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{title}</p>
                        <p className="text-[11px] text-stone-500">{description}</p>
                      </div>
                      {index < 3 && <ArrowRight className="ml-auto size-3 text-stone-300 hidden sm:block" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-100/70 p-5 text-slate-800 text-xs h-full flex flex-col justify-between">
                <div>
                  <p className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-2">
                    <Info className="size-4 text-stone-600" /> Methodological and Scale Note
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Brussels and Amsterdam are operationalised at the <strong>neighbourhood level</strong> (quartier/wijk). Istanbul and Izmir are operationalised at the <strong>district level</strong> (ilce) reflecting municipal open data structures.
                  </p>
                </div>
                <p className="mt-4 text-[10px] text-stone-400 font-mono">
                  Comparative Urban Governance Pilot · 2026
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* METHODOLOGY & ANALYTICAL FRAMEWORK TAB */
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

          {/* Core Risk Operationalisation Formula Box */}
          <div className="mb-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#c2410c] mb-2 flex items-center gap-2">
              <Compass className="size-4" /> IPCC Climate Risk Operationalisation
            </h3>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center my-3">
              <p className="font-mono text-sm md:text-base font-bold text-slate-900">
                Priority Score = (w_heat * Heat) + (w_age * Age) + (w_income * Low Income) + (w_canopy * Canopy Deficit)
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Grounded in the IPCC Risk Framework (Risk = Hazard * Exposure * Vulnerability), the model converts raw administrative data into standardised 1-5 relative scores within each city. The weights (w) are not mathematical truths—they represent <strong>normative political choices</strong> made by human decision-makers.
            </p>
          </div>

          {/* Section 1: Data Operationalisation */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-[#c2410c]" /> 1. Data Operationalisation and Indicator Rationale
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
              Algorithmic scoring models are never neutral; the choice of indicators defines what the municipal bureaucracy sees and what it ignores. Our dataset operationalises four foundational dimensions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Flame className="size-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Thermal Heat Proxy</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Operational Definition:</strong> Composite indicator based on Land Surface Temperature (LST) anomalies and impervious surface ratio.
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
                  <strong>Operational Definition:</strong> Proportion of residents aged 65 and above, weighted by single-person household isolation.
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
                  <strong>Operational Definition:</strong> Inverse median disposable household income and low-income subsidy dependency rates.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Trees className="size-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Canopy Deficit</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Operational Definition:</strong> Relative deficit of urban tree canopy and public green shade per capita across neighbourhood fabrics.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Environmental Justice Dimensions */}
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

          {/* Section 3: 4-City Comparative Urban Governance Context */}
          <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <Globe className="size-4 text-[#c2410c]" /> 3. Comparative Urban Governance Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-stone-600">
              <div className="border-l-2 border-slate-900 pl-3.5">
                <h4 className="font-bold text-slate-900 mb-1">Brussels-Capital</h4>
                <p className="leading-relaxed">
                  High socio-spatial polarization along the canal (Molenbeek, Cureghem vs. affluent south). Guided by Bruxelles Environnement and FARI ethical AI frameworks.
                </p>
              </div>
              <div className="border-l-2 border-[#c2410c] pl-3.5">
                <h4 className="font-bold text-slate-900 mb-1">Amsterdam</h4>
                <p className="leading-relaxed">
                  Pioneer in algorithmic accountability via the Amsterdam Algorithm Register. Audited across historic center density and post-war estates (Nieuw-West, Zuidoost).
                </p>
              </div>
              <div className="border-l-2 border-amber-600 pl-3.5">
                <h4 className="font-bold text-slate-900 mb-1">Istanbul</h4>
                <p className="leading-relaxed">
                  Extreme density and UHI in historic/industrial corridors (Fatih, Bağcılar) contrasting with the northern green belt. Audited using IPA urban climate reports.
                </p>
              </div>
              <div className="border-l-2 border-sky-600 pl-3.5">
                <h4 className="font-bold text-slate-900 mb-1">Izmir</h4>
                <p className="leading-relaxed">
                  Mediterranean microclimate with severe central heat accumulation (Konak, Buca) and high coastal elderly demographics (Karşıyaka). Based on IZKA/IZPA data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
