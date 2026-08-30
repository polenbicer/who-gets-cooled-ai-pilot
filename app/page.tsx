'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Flame,
  Info,
  Search,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
};

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREdQHMp0P_JjheI_LaV__Ds8AhETMiRwH3BX9GUIbwHTG_Y0JmAim-at3d4whwILQxOYJLws28-fjH/pub?output=csv";

const NEIGHBOURHOOD_COORDS: Record<string, { x: number; y: number }> = {
  // Brussels
  'Marolles': { x: 46, y: 56 },
  'Molenbeek Historique': { x: 36, y: 42 },
  'Cureghem Bara': { x: 38, y: 64 },
  'Châtelain': { x: 56, y: 68 },
  "Vivier d'Oie": { x: 62, y: 88 },
  'Schaerbeek (Helmet)': { x: 66, y: 30 },
  'Matonge': { x: 55, y: 58 },
  'Laeken (Centre)': { x: 42, y: 22 },
  'Saint-Gilles': { x: 48, y: 68 },
  'Flagey - Malibran': { x: 60, y: 65 },

  // Amsterdam
  'Amsterdamse Poort e.o.': { x: 76, y: 78 },
  'De Kolenkit': { x: 32, y: 48 },
  'Burgwallen-Oude Zijde': { x: 50, y: 44 },
  'Apollobuurt': { x: 46, y: 66 },
  'Buitenveldert-West': { x: 42, y: 82 },
  'Nieuw-West': { x: 28, y: 58 },
  'Zuidoost': { x: 74, y: 74 },
  'Noord': { x: 54, y: 24 },
  'Oost': { x: 68, y: 52 },
  'Centrum': { x: 50, y: 46 },
};

function parseNeighbourhoodCSV(csvText: string): Neighbourhood[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const cityIdx = headers.indexOf('city');
  const nameIdx = headers.indexOf('area_name');
  const heatIdx = headers.indexOf('relative_heat_proxy_score_1_5');
  const ageIdx = headers.indexOf('age_vulnerability_score_1_5');
  const incomeIdx = headers.indexOf('income_vulnerability_score_1_5');
  const notesIdx = headers.indexOf('notes');

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const cityRaw = values[cityIdx] || 'Brussels';
    const city: City = cityRaw.toLowerCase().includes('amsterdam') ? 'Amsterdam' : 'Brussels';

    return {
      city,
      name: values[nameIdx] || 'Unknown',
      heat: parseFloat(values[heatIdx]) || 1,
      age: parseFloat(values[ageIdx]) || 1,
      income: parseFloat(values[incomeIdx]) || 1,
      profile: values[notesIdx] || 'Socio-spatial heat exposure profile',
    };
  });
}

const neighbourhoods: Neighbourhood[] = [
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
  heat: { label: 'Heat-first', heatWeight: 0.7, socialWeight: 0.3, note: 'Prioritises physical heat exposure.' },
  balanced: { label: 'Balanced', heatWeight: 0.5, socialWeight: 0.5, note: 'Gives equal weight to heat and social vulnerability.' },
  justice: { label: 'Justice-first', heatWeight: 0.3, socialWeight: 0.7, note: 'Prioritises social vulnerability in the allocation rule.' },
};

const chartConfig = {
  score: { label: 'Priority score', color: 'var(--primary)' },
} satisfies ChartConfig;

function profileTone(profile: string) {
  if (profile.startsWith('High heat')) return 'bg-rose-50 text-rose-800 ring-rose-200';
  if (profile.startsWith('Age')) return 'bg-amber-50 text-amber-900 ring-amber-200';
  return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
}

export default function Home() {
  const [data, setData] = useState<Neighbourhood[]>(neighbourhoods);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'methodology'>('dashboard');
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<Neighbourhood | null>(null);

  // Policy Simulator Custom Weights
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/80 bg-card/90">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('methodology')}
              className={`px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'methodology'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Methodology & Framework
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold leading-tight">Who Gets Cooled?</p>
              <p className="text-xs text-muted-foreground">Urban Heat AI Decision Sandbox</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-muted-foreground">
              Developed by <strong className="font-semibold text-foreground">Polen Bicer</strong>
            </span>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              Research pilot · Live dataset
            </Badge>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-10">
          <section className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div className="max-w-3xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                <BrainCircuit className="size-4" aria-hidden="true" /> AI-assisted, human-governed
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
                Explore who moves up the cooling priority list—and why.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                Who Gets Cooled? is an open research prototype and decision-audit tool investigating the intersection of algorithmic governance, urban climate adaptation, and environmental justice. By auditing how local governments in Brussels and Amsterdam deploy data-driven cooling strategies, this project examines whether AI-assisted climate interventions protect the most vulnerable populations or reinforce spatial inequalities.
              </p>
              <p className="mt-4 inline-flex items-center rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                Developed by&nbsp;<strong className="font-semibold text-foreground">Polen Bicer</strong>
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a neighbourhood…"
                aria-label="Search a neighbourhood"
                className="h-11 bg-card pl-10 shadow-sm"
              />
              {matches.length > 0 && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-popover p-1 shadow-xl">
                  {matches.map((match) => (
                    <button
                      key={`${match.city}-${match.name}`}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                      onClick={() => {
                        setCity(match.city);
                        setQuery('');
                      }}
                    >
                      <span>{match.name}</span>
                      <span className="text-xs text-muted-foreground">{match.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Interactive Weight Policy Simulator */}
          <div className="p-5 mb-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Sliders className="size-4 text-primary" /> Interactive Policy Weight Simulator
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust custom weights dynamically to audit how algorithmic scoring shifts municipal priority rankings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomWeights(!isCustomWeights)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                  isCustomWeights ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {isCustomWeights ? '✓ Custom Weights Active' : 'Enable Custom Weights'}
              </button>
            </div>

            {isCustomWeights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/50">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5"><Flame className="size-3.5 text-rose-500" /> Heat Weight</span>
                    <span className="text-rose-500 font-bold">{heatWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heatWeight}
                    onChange={(e) => setHeatWeight(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5"><Users className="size-3.5 text-amber-500" /> Elderly (65+) Weight</span>
                    <span className="text-amber-500 font-bold">{ageWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ageWeight}
                    onChange={(e) => setAgeWeight(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-500" /> Low Income Weight</span>
                    <span className="text-emerald-500 font-bold">{incomeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={incomeWeight}
                    onChange={(e) => setIncomeWeight(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          <section className="mb-6 grid gap-4 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_2fr] md:p-5">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              City
              <Select value={city} onValueChange={(value) => setCity(value as City)}>
                <SelectTrigger className="h-10 w-full bg-background text-sm font-medium normal-case tracking-normal text-foreground">
                  <Building2 className="size-4 text-primary" aria-hidden="true" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brussels">Brussels</SelectItem>
                  <SelectItem value="Amsterdam">Amsterdam</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              Preset Policy rule
              <Select disabled={isCustomWeights} value={scenario} onValueChange={(value) => setScenario(value as Scenario)}>
                <SelectTrigger className="h-10 w-full bg-background text-sm font-medium normal-case tracking-normal text-foreground">
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  <SelectValue>{isCustomWeights ? 'Custom Weights Mode' : rule.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heat">Heat-first</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="justice">Justice-first</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <div className="rounded-xl bg-secondary px-4 py-3">
              {isCustomWeights ? (
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-sm font-semibold text-primary">Custom Simulation Active:</span>
                    <span className="text-xs text-muted-foreground">{heatWeight}% Heat / {ageWeight}% Age / {incomeWeight}% Income</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Priority rankings below are reflecting dynamic user weights.</p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2"><Flame className="size-4 text-rose-600" /><span className="text-sm font-semibold">{Math.round(rule.heatWeight * 100)}% heat</span></div>
                    <div className="flex items-center gap-2"><Users className="size-4 text-emerald-700" /><span className="text-sm font-semibold">{Math.round(rule.socialWeight * 100)}% social vulnerability</span></div>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{rule.note}</p>
                </div>
              )}
            </div>
          </section>

          {/* Interactive Spatial Exposure Map */}
          <div className="p-5 mb-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-base text-foreground">Spatial Exposure Map ({city})</h3>
                <p className="text-xs text-muted-foreground">Interactive spatial layout showing relative vulnerability. Click any node to inspect.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-500 inline-block"></span> High Priority</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-500 inline-block"></span> Moderate Priority</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500 inline-block"></span> Lower Priority</span>
              </div>
            </div>

            <div className="relative w-full h-[300px] bg-muted/20 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeOpacity="0.06" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {ranked.map((item) => {
                  const coords = NEIGHBOURHOOD_COORDS[item.name] || { x: 50, y: 50 };
                  const isSelected = selectedPin?.name === item.name;
                  const pinColor = item.score > 3.8 ? '#f43f5e' : item.score > 2.5 ? '#f59e0b' : '#10b981';

                  return (
                    <g
                      key={item.name}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => setSelectedPin(item)}
                    >
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? 4 : 2.5}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 1 : 0.4}
                        className="transition-all duration-200"
                      />
                      <text
                        x={coords.x}
                        y={coords.y - 3.5}
                        fontSize="2.9"
                        textAnchor="middle"
                        className="font-medium select-none pointer-events-none fill-foreground"
                      >
                        {item.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {selectedPin && (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 bg-background/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl text-xs">
                  <div className="flex items-center justify-between font-semibold text-foreground mb-1">
                    <span className="text-sm">{selectedPin.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPin(null)}
                      className="text-muted-foreground hover:text-foreground text-base leading-none px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 text-center my-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Heat Proxy</span>
                      <span className="font-bold text-rose-500 text-sm">{selectedPin.heat.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Elderly</span>
                      <span className="font-bold text-amber-500 text-sm">{selectedPin.age.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Income Vuln.</span>
                      <span className="font-bold text-emerald-500 text-sm">{selectedPin.income.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">{selectedPin.profile}</p>
                </div>
              )}
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
            <Card className="border-0 shadow-[0_12px_35px_rgba(21,54,43,0.08)] ring-1 ring-border">
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Neighbourhood priority ranking</CardTitle>
                    <CardDescription>Scores are relative within {city}; 5 is the highest priority.</CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {isCustomWeights ? 'Custom Weights' : rule.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto md:h-[360px]">
                  <BarChart data={ranked} layout="vertical" margin={{ left: 8, right: 22, top: 4, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} tickCount={6} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={145} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip cursor={{ fill: 'var(--secondary)' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="score" fill="var(--color-score)" radius={[0, 7, 7, 0]} barSize={28} />
                  </BarChart>
                </ChartContainer>

                <div className="mt-5 overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader className="bg-secondary/70">
                      <TableRow>
                        <TableHead className="w-14">Rank</TableHead>
                        <TableHead>Neighbourhood</TableHead>
                        <TableHead className="hidden lg:table-cell">AI vulnerability profile</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranked.map((area) => (
                        <TableRow key={area.name}>
                          <TableCell className="font-mono text-muted-foreground">{area.rank}</TableCell>
                          <TableCell className="font-medium">{area.name}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${profileTone(area.profile)}`}>{area.profile}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">{area.score.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid content-start gap-5">
              <Card className="border-0 bg-primary text-primary-foreground shadow-[0_18px_45px_rgba(20,69,53,0.22)] ring-0">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary-foreground/70">Top priority under this rule</p>
                  <CardTitle className="text-2xl">{top.name}</CardTitle>
                  <CardDescription className="text-primary-foreground/70">{city} · score {top.score ? top.score.toFixed(2) : 'N/A'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Heat', top.heat],
                      ['Age', top.age],
                      ['Income', top.income],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl bg-white/10 p-3">
                        <p className="text-[11px] text-primary-foreground/65">{label}</p>
                        <p className="mt-1 font-mono text-lg font-semibold">{Number(value).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3 text-sm leading-5">
                    <BrainCircuit className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{top.profile}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Info className="size-4 text-primary" /> Where AI enters</CardTitle>
                  <CardDescription>The model supports one stage of the chain; it does not make the final decision.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    ['Public data', 'Heat, age and income indicators'],
                    ['AI profiling', 'K-means identifies similar risk patterns'],
                    ['Human values', 'Officials choose the policy weights'],
                    ['Public decision', 'Local knowledge and deliberation remain decisive'],
                  ].map(([title, description], index) => (
                    <div key={title} className="flex gap-3">
                      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold text-primary">{index + 1}</div>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
                      </div>
                      {index < 3 && <ArrowRight className="ml-auto mt-1 hidden size-4 text-border sm:block" aria-hidden="true" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <p className="flex items-center gap-2 text-sm font-semibold"><Info className="size-4" /> Important limitation</p>
                <p className="mt-2 text-xs leading-5 text-amber-900/80">
                  This proof of concept uses selected neighbourhoods and proxy indicators—not measured local temperature. Results are exploratory, city-relative and should support, never replace, democratic decision-making.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-8">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading">
              Methodology & Analytical Framework
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-3xl">
              This research prototype investigates the algorithmic governance of urban heat adaptation, focusing on how data-driven interventions are justified, deployed, and audited across socio-spatial inequalities in Brussels and Amsterdam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-sm">01</span>
                <h3 className="font-semibold text-lg text-foreground">Socio-Spatial Environmental Justice</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Urban heat islands (UHI) disproportionately affect socially vulnerable neighborhoods with lower tree canopy density and higher building density. This prototype maps surface temperature anomalies against socio-economic vulnerability indicators to audit cooling disparities.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-sm">02</span>
                <h3 className="font-semibold text-lg text-foreground">Algorithmic Legitimacy Chain</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drawing on Fritz Scharpf and Vivien Schmidt&apos;s legitimacy framework, policies are evaluated across:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Input Legitimacy:</strong> Citizen participation, deliberative processes, and vulnerable group inclusion.</li>
                <li><strong>Throughput Legitimacy:</strong> Procedural transparency, algorithm register disclosures, and legal oversight.</li>
                <li><strong>Output Legitimacy:</strong> Measurable heat reduction and efficiency claims in municipal action plans.</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-sm">03</span>
                <h3 className="font-semibold text-lg text-foreground">Comparative Case Strategy</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Brussels Capital Region:</strong> Multi-level regional governance, FARI AI for Common Good Institute, and Bruxelles Environnement climate resilience initiatives.<br className="mb-2"/>
                <strong>Amsterdam:</strong> Pioneering algorithmic transparency via the Amsterdam Algorithm Register and automated spatial decision tools.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-sm">04</span>
                <h3 className="font-semibold text-lg text-foreground">Data Pipeline & Decision Audit</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The decision-support audit cross-references satellite thermal observations (Copernicus Land Monitoring Service), municipal tree inventory data, and census-level socioeconomic vulnerability to calculate the <em>Cooling Priority Index</em>.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}