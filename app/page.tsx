'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  Flame,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
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

function scoreArea(area: Neighbourhood, scenario: Scenario) {
  const social = (area.age + area.income) / 2;
  const rule = scenarios[scenario];
  return area.heat * rule.heatWeight + social * rule.socialWeight;
}

function profileTone(profile: string) {
  if (profile.startsWith('High heat')) return 'bg-rose-50 text-rose-800 ring-rose-200';
  if (profile.startsWith('Age')) return 'bg-amber-50 text-amber-900 ring-amber-200';
  return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
}

export default function Home() {
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');

  const ranked = useMemo(() => {
    return neighbourhoods
      .filter((area) => area.city === city)
      .map((area) => ({ ...area, social: (area.age + area.income) / 2, score: scoreArea(area, scenario) }))
      .sort((a, b) => b.score - a.score)
      .map((area, index) => ({ ...area, rank: index + 1 }));
  }, [city, scenario]);

  const matches = useMemo(() => {
    const cleanQuery = query.trim().toLocaleLowerCase();
    if (!cleanQuery) return [];
    return neighbourhoods.filter((area) => area.name.toLocaleLowerCase().includes(cleanQuery));
  }, [query]);

  const top = ranked[0];
  const rule = scenarios[scenario];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/80 bg-card/90">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-4 md:px-8">
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
              Research pilot · 10 neighbourhoods
            </Badge>
          </div>
        </div>
      </div>

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
              This research prototype explores how AI-assisted urban heat governance can make competing policy values visible. Using open municipal indicators for 10 neighbourhoods in Brussels and Amsterdam, it converts heat exposure, age vulnerability and income vulnerability into relative 1–5 scores, applies K-means clustering to identify similar risk profiles, and compares heat-first, balanced and justice-first allocation rules. Its purpose is not to automate public decisions, but to reveal how data choices and policy weights can change which neighbourhoods are prioritised for cooling—and to keep the final decision open to public scrutiny and human judgment.
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
            Policy rule
            <Select value={scenario} onValueChange={(value) => setScenario(value as Scenario)}>
              <SelectTrigger className="h-10 w-full bg-background text-sm font-medium normal-case tracking-normal text-foreground">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                <SelectValue>{rule.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heat">Heat-first</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="justice">Justice-first</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div className="rounded-xl bg-secondary px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2"><Flame className="size-4 text-rose-600" /><span className="text-sm font-semibold">{Math.round(rule.heatWeight * 100)}% heat</span></div>
              <div className="flex items-center gap-2"><Users className="size-4 text-emerald-700" /><span className="text-sm font-semibold">{Math.round(rule.socialWeight * 100)}% social vulnerability</span></div>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{rule.note}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
          <Card className="border-0 shadow-[0_12px_35px_rgba(21,54,43,0.08)] ring-1 ring-border">
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Neighbourhood priority ranking</CardTitle>
                  <CardDescription>Scores are relative within {city}; 5 is the highest priority.</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{rule.label}</Badge>
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
                <CardDescription className="text-primary-foreground/70">{city} · score {top.score.toFixed(2)}</CardDescription>
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
                This proof of concept uses 10 selected neighbourhoods and proxy indicators—not measured local temperature. Results are exploratory, city-relative and should support, never replace, democratic decision-making.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
