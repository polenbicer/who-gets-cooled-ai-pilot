'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Flame,
  Info,
  Layers,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sliders,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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

type City = 'Brussels' | 'Amsterdam';
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

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREdQHMp0P_JjheI_LaV__Ds8AhETMiRwH3BX9GUIbwHTG_Y0JmAim-at3d4whwILQxOYJLws28-fjH/pub?output=csv";

// Coğrafi Enlem / Boylam Yedekleri
const REAL_COORDS: Record<string, { lat: number; lng: number }> = {
  // Brussels
  'Marolles': { lat: 50.8385, lng: 4.3468 },
  'Molenbeek Historique': { lat: 50.8546, lng: 4.3340 },
  'Cureghem Bara': { lat: 50.8402, lng: 4.3308 },
  'Châtelain': { lat: 50.8242, lng: 4.3601 },
  "Vivier d'Oie": { lat: 50.7892, lng: 4.3755 },
  'Schaerbeek (Helmet)': { lat: 50.8690, lng: 4.3780 },
  'Matonge': { lat: 50.8378, lng: 4.3645 },
  'Laeken (Centre)': { lat: 50.8752, lng: 4.3540 },
  'Saint-Gilles': { lat: 50.8280, lng: 4.3450 },
  'Flagey - Malibran': { lat: 50.8285, lng: 4.3725 },

  // Amsterdam
  'Amsterdamse Poort e.o.': { lat: 52.3145, lng: 4.9542 },
  'De Kolenkit': { lat: 52.3785, lng: 4.8480 },
  'Burgwallen-Oude Zijde': { lat: 52.3718, lng: 4.8980 },
  'Apollobuurt': { lat: 52.3485, lng: 4.8770 },
  'Buitenveldert-West': { lat: 52.3275, lng: 4.8620 },
  'Nieuw-West': { lat: 52.3610, lng: 4.8150 },
  'Zuidoost': { lat: 52.3110, lng: 4.9650 },
  'Noord': { lat: 52.3990, lng: 4.9250 },
  'Oost': { lat: 52.3580, lng: 4.9350 },
  'Centrum': { lat: 52.3702, lng: 4.8952 },
};

const CITY_CENTERS: Record<City, { lat: number; lng: number; zoom: number }> = {
  Brussels: { lat: 50.8420, lng: 4.3550, zoom: 12 },
  Amsterdam: { lat: 52.3550, lng: 4.8950, zoom: 12 },
};

function parseNeighbourhoodCSV(csvText: string): Neighbourhood[] {
  const parseRow = (text: string) => {
    const result: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(field.trim().replace(/^"|"$/g, ''));
        field = '';
      } else {
        field += char;
      }
    }
    result.push(field.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseRow(lines[0]).map(h => h.toLowerCase());
  const cityIdx = headers.indexOf('city');
  const nameIdx = headers.indexOf('area_name');
  const heatIdx = headers.indexOf('relative_heat_proxy_score_1_5');
  const ageIdx = headers.indexOf('age_vulnerability_score_1_5');
  const incomeIdx = headers.indexOf('income_vulnerability_score_1_5');
  const notesIdx = headers.indexOf('notes') !== -1 ? headers.indexOf('notes') : headers.indexOf('ai_vulnerability_profile');
  const latIdx = headers.indexOf('lat');
  const lngIdx = headers.indexOf('lng');

  return lines.slice(1).map(line => {
    const values = parseRow(line);
    const cityRaw = values[cityIdx] || 'Brussels';
    const city: City = cityRaw.toLowerCase().includes('amsterdam') ? 'Amsterdam' : 'Brussels';
    const name = values[nameIdx] || 'Unknown';

    const heat = parseFloat(values[heatIdx]?.replace(',', '.')) || 1;
    const age = parseFloat(values[ageIdx]?.replace(',', '.')) || 1;
    const income = parseFloat(values[incomeIdx]?.replace(',', '.')) || 1;

    let profile = values[notesIdx] || '';
    if (!profile || profile.includes('temperature.') || !isNaN(Number(profile))) {
      if (heat >= 4 && income >= 4) profile = 'High heat + income vulnerability';
      else if (age >= 4) profile = 'Age vulnerability + lower heat';
      else if (income >= 4) profile = 'Income vulnerability + lower heat';
      else profile = 'Moderate socio-spatial risk';
    }

    return {
      city,
      name,
      heat,
      age,
      income,
      profile,
      lat: latIdx !== -1 && values[latIdx] ? parseFloat(values[latIdx].replace(',', '.')) : undefined,
      lng: lngIdx !== -1 && values[lngIdx] ? parseFloat(values[lngIdx].replace(',', '.')) : undefined,
    };
  });
}

const defaultNeighbourhoods: Neighbourhood[] = [
  { city: 'Brussels', name: 'Marolles', heat: 4.79, age: 2.26, income: 4.87, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Molenbeek Historique', heat: 4.77, age: 1.54, income: 5, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Cureghem Bara', heat: 5, age: 1, income: 4.95, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: 'Châtelain', heat: 4.23, age: 1.35, income: 2.56, profile: 'High heat + income vulnerability' },
  { city: 'Brussels', name: "Vivier d'Oie", heat: 1, age: 5, income: 1, profile: 'Age vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'Amsterdamse Poort e.o.', heat: 1.17, age: 1, income: 5, profile: 'Income vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'De Kolenkit', heat: 1.46, age: 1.3, income: 4.62, profile: 'Income vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'Burgwallen-Oude Zijde', heat: 5, age: 1.89, income: 4.9, profile: 'High heat + income vulnerability' },
  { city: 'Amsterdam', name: 'Apollobuurt', heat: 2.08, age: 4.23, income: 1, profile: 'Age vulnerability + lower heat' },
  { city: 'Amsterdam', name: 'Buitenveldert-West', heat: 1, age: 5, income: 3.97, profile: 'Age vulnerability + lower heat' },
];

const scenarios: Record<Scenario, { label: string; heatWeight: number; socialWeight: number; note: string }> = {
  heat: { label: 'Heat-first', heatWeight: 0.7, socialWeight: 0.3, note: 'Prioritises physical heat exposure and surface temperature anomalies.' },
  balanced: { label: 'Balanced', heatWeight: 0.5, socialWeight: 0.5, note: 'Gives equal normative weight to thermal risk and demographic vulnerability.' },
  justice: { label: 'Justice-first', heatWeight: 0.3, socialWeight: 0.7, note: 'Prioritises socio-economic inequality and elderly isolation in cooling allocation.' },
};

const chartConfig = {
  score: { label: 'Priority score', color: '#c2410c' },
} satisfies ChartConfig;

function profileTone(profile: string) {
  if (profile.startsWith('High heat')) return 'bg-rose-50 text-rose-800 ring-rose-200 border-rose-200';
  if (profile.startsWith('Age')) return 'bg-amber-50 text-amber-900 ring-amber-200 border-amber-200';
  return 'bg-stone-100 text-stone-800 ring-stone-200 border-stone-200';
}

export default function Home() {
  const [data, setData] = useState<Neighbourhood[]>(defaultNeighbourhoods);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'methodology'>('dashboard');
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');

  // Policy Simulator
  const [heatWeight, setHeatWeight] = useState<number>(34);
  const [ageWeight, setAgeWeight] = useState<number>(33);
  const [incomeWeight, setIncomeWeight] = useState<number>(33);
  const [isCustomWeights, setIsCustomWeights] = useState<boolean>(false);

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const parsed = parseNeighbourhoodCSV(csvText);
        if (parsed.length > 0) {
          setData(parsed);
        }
      })
      .catch(err => console.error('Error fetching live Google Sheet:', err));
  }, []);

  const ranked = useMemo(() => {
    return data
      .filter((area) => area.city === city)
      .map((area) => {
        let calculatedScore = 0;
        if (isCustomWeights) {
          calculatedScore = (area.heat * (heatWeight / 100)) + (area.age * (ageWeight / 100)) + (area.income * (incomeWeight / 100));
        } else {
          const social = (area.age + area.income) / 2;
          const rule = scenarios[scenario];
          calculatedScore = area.heat * rule.heatWeight + social * rule.socialWeight;
        }
        return {
          ...area,
          social: (area.age + area.income) / 2,
          score: calculatedScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((area, index) => ({ ...area, rank: index + 1 }));
  }, [data, city, scenario, isCustomWeights, heatWeight, ageWeight, incomeWeight]);

  const matches = useMemo(() => {
    const cleanQuery = query.trim().toLocaleLowerCase();
    if (!cleanQuery) return [];
    return data.filter((area) => area.name.toLocaleLowerCase().includes(cleanQuery));
  }, [query, data]);

  const top = ranked[0] || data[0];
  const rule = scenarios[scenario];

  // OpenStreetMap Harita Entegrasyonu
  const mapHtml = useMemo(() => {
    const center = CITY_CENTERS[city];
    const pinsJson = JSON.stringify(
      ranked.map(item => {
        const lat = item.lat ?? REAL_COORDS[item.name]?.lat ?? center.lat;
        const lng = item.lng ?? REAL_COORDS[item.name]?.lng ?? center.lng;
        const color = item.score > 3.8 ? '#dc2626' : item.score > 2.5 ? '#d97706' : '#475569';
        return {
          name: item.name,
          lat,
          lng,
          score: item.score.toFixed(2),
          heat: item.heat.toFixed(2),
          age: item.age.toFixed(2),
          income: item.income.toFixed(2),
          profile: item.profile,
          color,
        };
      })
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin:0; padding:0; height:100%; width:100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          #map { height: 100%; width: 100%; background: #f1f5f9; }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.15s ease-in-out;
          }
          .custom-pin:hover { transform: scale(1.25); }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(15,23,42,0.15);
            padding: 2px;
          }
          .popup-title { font-weight: 700; font-size: 13.5px; margin-bottom: 2px; color: #0f172a; }
          .popup-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
          .popup-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: 10px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
          .metric-box { text-align: center; }
          .metric-val { font-weight: bold; font-size: 11.5px; display: block; }
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

          const pins = ${pinsJson};

          pins.forEach(pin => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: \`<div class="custom-pin" style="background:\${pin.color}; width:18px; height:18px;"></div>\`,
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            });

            const popupContent = \`
              <div style="min-width: 155px;">
                <div class="popup-title">\${pin.name}</div>
                <div class="popup-badge" style="background:\${pin.color}15; color:\${pin.color};">Score: \${pin.score}</div>
                <div style="font-size:10px; color:#475569; line-height:1.3;">\${pin.profile}</div>
                <div class="popup-metrics">
                  <div class="metric-box"><span style="color:#64748b;">Heat</span><span class="metric-val" style="color:#dc2626;">\${pin.heat}</span></div>
                  <div class="metric-box"><span style="color:#64748b;">Age</span><span class="metric-val" style="color:#d97706;">\${pin.age}</span></div>
                  <div class="metric-box"><span style="color:#64748b;">Income</span><span class="metric-val" style="color:#0284c7;">\${pin.income}</span></div>
                </div>
              </div>
            \`;

            L.marker([pin.lat, pin.lng], { icon: icon })
              .addTo(map)
              .bindPopup(popupContent);
          });
        </script>
      </body>
      </html>
    `;
  }, [ranked, city]);

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

          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-slate-900 text-amber-400 shadow-sm">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-serif text-base font-bold tracking-tight text-slate-900 leading-tight">Who Gets Cooled?</p>
              <p className="text-[11px] text-stone-500 font-medium">Urban Heat AI Decision Sandbox</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-stone-500">
              Developed by <strong className="font-semibold text-slate-900">Polen Bicer</strong>
            </span>
            <Badge variant="outline" className="border-stone-300 bg-stone-50 text-slate-700 text-[11px] font-medium">
              Research Pilot · Live Data
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
                <BrainCircuit className="size-4" aria-hidden="true" /> Algorithmic Governance Audit
              </p>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950 md:text-5xl leading-tight">
                Explore who moves up the cooling priority list—and why.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-600 md:text-base">
                An open research prototype investigating the intersection of algorithmic governance, urban climate adaptation, and environmental justice. By auditing how local governments in Brussels and Amsterdam deploy data-driven cooling interventions, this tool examines whether AI-assisted allocation protects the most vulnerable populations or reinforces spatial inequalities.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a neighbourhood…"
                aria-label="Search a neighbourhood"
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

          {/* HIGH-IMPACT INTERACTIVE POLICY CONTROL DECK */}
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

            {/* Top Row: Cities & Policy Rules via High-Affordance Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* City Switcher */}
              <div className="lg:col-span-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  1. Select Urban Context
                </label>
                <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCity('Brussels')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      city === 'Brussels'
                        ? 'bg-white text-slate-950 shadow-sm border border-stone-200/60'
                        : 'text-stone-600 hover:text-slate-950'
                    }`}
                  >
                    <Building2 className="size-3.5 text-slate-700" />
                    Brussels
                  </button>
                  <button
                    type="button"
                    onClick={() => setCity('Amsterdam')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      city === 'Amsterdam'
                        ? 'bg-white text-slate-950 shadow-sm border border-stone-200/60'
                        : 'text-stone-600 hover:text-slate-950'
                    }`}
                  >
                    <Building2 className="size-3.5 text-slate-700" />
                    Amsterdam
                  </button>
                </div>
              </div>

              {/* Policy Rule Preset Selector */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    2. Choose Policy Framework
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
                  <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                    {(['heat', 'balanced', 'justice'] as Scenario[]).map((scKey) => {
                      const active = scenario === scKey;
                      const label = scKey === 'heat' ? 'Heat-First (70/30)' : scKey === 'balanced' ? 'Balanced (50/50)' : 'Justice-First (30/70)';
                      return (
                        <button
                          key={scKey}
                          type="button"
                          onClick={() => setScenario(scKey)}
                          className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all truncate ${
                            active
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-stone-600 hover:bg-white/60 hover:text-slate-950'
                          }`}
                        >
                          {label}
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

            {/* Policy Rule Dynamic Note Banner */}
            {!isCustomWeights ? (
              <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-700 flex items-center gap-1"><Flame className="size-3.5" /> {Math.round(rule.heatWeight * 100)}% Heat Weight</span>
                  <span className="text-stone-300">|</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1"><Users className="size-3.5" /> {Math.round(rule.socialWeight * 100)}% Social Vulnerability</span>
                </div>
                <p className="text-stone-500 text-[11px] italic">{rule.note}</p>
              </div>
            ) : null}

            {/* Custom Sliders (Shown when toggled) */}
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

          {/* 1. SECTION: Priority Ranking & Top Priority Target */}
          <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(400px,0.65fr)]">
            <Card className="border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">Neighbourhood Priority Ranking</CardTitle>
                    <CardDescription className="text-xs text-stone-500">City-relative score index (5 = highest intervention urgency).</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-stone-300 bg-stone-50 text-slate-800 text-xs font-semibold">
                    {isCustomWeights ? 'Custom Weights' : rule.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <ChartContainer config={chartConfig} className="h-[280px] w-full aspect-auto md:h-[340px]">
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
                        <TableHead className="text-xs font-bold text-stone-600">Neighbourhood</TableHead>
                        <TableHead className="hidden lg:table-cell text-xs font-bold text-stone-600">AI Vulnerability Profile</TableHead>
                        <TableHead className="text-right text-xs font-bold text-stone-600">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranked.map((area) => (
                        <TableRow key={area.name} className="border-stone-100 hover:bg-stone-50/60">
                          <TableCell className="font-mono text-xs text-stone-500 font-semibold">{area.rank}</TableCell>
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

            {/* Top Priority Target Card */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-md border border-slate-900 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Top Priority Target</p>
                <h3 className="mt-1 font-serif text-3xl font-bold">{top.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{city} · priority score {top.score ? top.score.toFixed(2) : 'N/A'}</p>

                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  {[
                    ['Heat Proxy', top.heat, 'text-rose-400'],
                    ['Elderly (65+)', top.age, 'text-amber-400'],
                    ['Low Income', top.income, 'text-sky-400'],
                  ].map(([label, value, colorClass]) => (
                    <div key={String(label)} className="rounded-xl bg-slate-900 p-3 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400">{label}</p>
                      <p className={`mt-0.5 font-mono text-lg font-bold ${colorClass}`}>{Number(value).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-900 p-3.5 text-xs leading-relaxed border border-slate-800 text-slate-300">
                <BrainCircuit className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span><strong>Profile:</strong> {top.profile}</span>
              </div>
            </div>
          </section>

          {/* 2. SECTION: OpenStreetMap Real Geographic View */}
          <div className="p-5 mb-8 rounded-2xl border border-stone-200 bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="size-4 text-[#c2410c]" /> Spatial Exposure & Risk Map ({city})
                </h3>
                <p className="text-xs text-stone-500">Real geographic map powered by OpenStreetMap. Click markers to inspect metrics.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium"><span className="size-2.5 rounded-full bg-red-600 inline-block"></span> High Risk</span>
                <span className="flex items-center gap-1.5 font-medium"><span className="size-2.5 rounded-full bg-amber-600 inline-block"></span> Moderate</span>
                <span className="flex items-center gap-1.5 font-medium"><span className="size-2.5 rounded-full bg-slate-600 inline-block"></span> Lower Baseline</span>
              </div>
            </div>

            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-stone-200 shadow-inner">
              <iframe
                title="Geographic Risk Map"
                srcDoc={mapHtml}
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* 3. SECTION: Bottom Conceptual & Methodological Summary (Where AI Enters) */}
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
                    ['Public Data Ingestion', 'Satellite thermal indices, tree canopy coverage, census data'],
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
                    <Info className="size-4 text-stone-600" /> Methodological Note
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    This research proof-of-concept calculates spatial priority based on proxy indicators rather than in-situ sensor telemetry. It is intended to audit algorithmic bias and enhance deliberative urban governance.
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
              Academic & Analytical Blueprint
            </Badge>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-950">
              Methodology & Theoretical Framework
            </h2>
            <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
              This research prototype investigates the algorithmic governance of urban climate adaptation. By auditing socio-spatial trade-offs in Brussels and Amsterdam, it examines how data modeling shapes environmental justice outcomes.
            </p>
          </div>

          {/* Section 1: Data Operationalisation */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-[#c2410c]" /> 1. Data Operationalisation & Indicator Rationale
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
                  <strong>Operational Definition:</strong> Composite indicator based on Copernicus Land Surface Temperature (LST) anomalies and high soil imperviousness (sealed concrete/asphalt ratio).
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 border-t border-stone-100 pt-2 italic">
                  <strong>Why it matters:</strong> Densely built urban fabrics with minimal tree canopy create severe Urban Heat Islands (UHI), preventing nocturnal cooling.
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
                  <strong>Operational Definition:</strong> Proportion of residents aged 65 and above, weighted by single-person household density from municipal census registries.
                </p>
                <p className="mt-2.5 text-[11px] text-stone-500 border-t border-stone-100 pt-2 italic">
                  <strong>Why it matters:</strong> Physiological thermoregulation decline combined with social isolation makes elderly residents the primary demographic for heat-wave mortality.
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
                  <strong>Why it matters:</strong> Low-income households face severe &apos;thermal energy poverty&apos;, lack private air-conditioning, and reside in poorly insulated rental housing.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Algorithmic Legitimacy Framework */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <Scale className="size-5 text-[#c2410c]" /> 2. Algorithmic Legitimacy Chain
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
              Grounded in the political science framework of Fritz Scharpf and Vivien Schmidt, we conceptualise automated decision-support systems along a three-stage democratic legitimacy chain:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#c2410c] px-2 py-0.5 rounded bg-amber-50">INPUT</span>
                  <h4 className="font-bold text-sm text-slate-900">Input Legitimacy</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Democratic Voice & Problem Framing</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Who decided what counts as a climate vulnerability? Evaluates participatory co-design, stakeholder representation, and whether vulnerable communities participated in setting optimization objectives.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-stone-100">THROUGHPUT</span>
                  <h4 className="font-bold text-sm text-slate-900">Throughput Legitimacy</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Procedural & Algorithmic Quality</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Is the scoring mechanism explainable and accountable? Focuses on public algorithm registries (e.g., Amsterdam Algorithm Register), transparent weighting schemes, and human-in-the-loop governance.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">OUTPUT</span>
                  <h4 className="font-bold text-sm text-slate-900">Output Legitimacy</h4>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">Substantive Justice & Efficiency</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Does the data-driven intervention actually cool the people who need it most? Audits whether tree-planting and cooling hubs prevent climate mortality without triggering green gentrification.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Comparative Urban Governance Context */}
          <div className="p-6 rounded-xl border border-stone-200 bg-white shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
              <Building2 className="size-4 text-[#c2410c]" /> 3. Comparative Urban Governance Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm text-stone-600">
              <div className="border-l-2 border-slate-900 pl-4">
                <h4 className="font-bold text-slate-900 mb-1">Brussels-Capital Region</h4>
                <p className="leading-relaxed">
                  Characterised by high socio-spatial polarization along the canal zone (e.g., Molenbeek, Cureghem vs. affluent green south). Institutional frameworks include Bruxelles Environnement climate plans and FARI (AI for the Common Good Institute) for ethical public algorithmic tools.
                </p>
              </div>
              <div className="border-l-2 border-[#c2410c] pl-4">
                <h4 className="font-bold text-slate-900 mb-1">City of Amsterdam</h4>
                <p className="leading-relaxed">
                  A global pioneer in algorithmic transparency via the mandatory Amsterdam Algorithm Register. Analyzed through its automated urban tree monitoring, climate adaptation maps, and post-war housing estate regeneration (Nieuw-West, Zuidoost).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}