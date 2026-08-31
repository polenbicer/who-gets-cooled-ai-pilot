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
  Trophy,
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
    note: 'Technocratic Determinism: Physical heat and impervious surfaces take absolute precedence over social inequalities.' 
  },
  balanced: { 
    label: 'Bureaucratic Compromise (50/50)', 
    heatWeight: 0.5, 
    socialWeight: 0.5, 
    note: 'Bureaucratic Compromise: Artificially splits weight evenly between physical anomalies and human demographics to avoid structural friction.' 
  },
  justice: { 
    label: 'Radical Spatial Justice (30/70)', 
    heatWeight: 0.3, 
    socialWeight: 0.7, 
    note: 'Radical Spatial Justice: Directs public cooling investments to systemic poverty and isolated elderly populations regardless of sensor dominance.' 
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'methodology' | 'sandbox'>('dashboard');
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [query, setQuery] = useState('');

  // Policy Simulator
  const [heatWeight, setHeatWeight] = useState<number>(34);
  const [ageWeight, setAgeWeight] = useState<number>(33);
  const [incomeWeight, setIncomeWeight] = useState<number>(33);
  const [isCustomWeights, setIsCustomWeights] = useState<boolean>(false);

  // What-If Interventions
  const [applyTrees, setApplyTrees] = useState<boolean>(false);
  const [applyShelter, setApplyShelter] = useState<boolean>(false);
  const [applyRetrofit, setApplyRetrofit] = useState<boolean>(false);

  // Mayor Game Sandbox State
  const [sandboxBudget, setSandboxBudget] = useState(100);
  const [sandboxJusticeIndex, setSandboxJusticeIndex] = useState(50);
  const [sandboxGameStatus, setSandboxGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [selectedSandboxNeighborhood, setSelectedSandboxNeighborhood] = useState('molenbeek');
  const [sandboxNeighborhoods, setSandboxNeighborhoods] = useState({
    molenbeek: { name: "Molenbeek", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
    ixelles: { name: "Ixelles", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 }
  });
  const [sandboxAlerts, setSandboxAlerts] = useState<string[]>([
    "System operational. Select a district and deploy urban policies, Mayor."
  ]);

  const activeSandboxN = sandboxNeighborhoods[selectedSandboxNeighborhood as keyof typeof sandboxNeighborhoods];

  const triggerSandboxAlert = (msg: string) => {
    setSandboxAlerts(prev => [msg, ...prev]);
  };

  const checkSandboxGameEnd = (newJustice: number, newBudget: number) => {
    if (newJustice >= 73) {
      setSandboxGameStatus('won');
      triggerSandboxAlert("🎉 Victory! You successfully balanced climate resilience and social justice, Mayor!");
    } else if (newBudget <= 0 || newJustice < 30) {
      setSandboxGameStatus('lost');
      triggerSandboxAlert("💀 Game Over! Budget depleted or social unrest boiled over. You lost the election!");
    }
  };

  const applySandboxPolicy = (policyType: string) => {
    if (sandboxGameStatus !== 'playing') return;

    let currentBudget = sandboxBudget;
    let currentJustice = sandboxJusticeIndex;
    let updatedNeighborhoods = { ...sandboxNeighborhoods };
    let targetN = { ...updatedNeighborhoods[selectedSandboxNeighborhood as keyof typeof updatedNeighborhoods] };
    let alertMessage = "";

    if (policyType === "greenCanopy") {
      if (currentBudget < 30) {
        triggerSandboxAlert("❌ Error: Insufficient municipal budget!");
        return;
      }
      currentBudget -= 30;
      targetN.greenCover = Math.min(100, targetN.greenCover + 25);
      targetN.heatRisk = Math.max(0, targetN.heatRisk - 20);

      if (targetN.vulnerability > 70) {
        targetN.gentrificationRisk = Math.min(100, targetN.gentrificationRisk + 40);
        alertMessage = `⚠️ Green Gentrification Risk in ${targetN.name}! Property values spiked; vulnerable residents face displacement.`;
        currentJustice = Math.max(0, currentJustice - 15);
      } else {
        alertMessage = `🌿 Green canopy successfully expanded in ${targetN.name}.`;
        currentJustice = Math.min(100, currentJustice + 12);
      }
    } 
    else if (policyType === "tenantProtection") {
      if (currentBudget < 20) {
        triggerSandboxAlert("❌ Error: Insufficient municipal budget!");
        return;
      }
      currentBudget -= 20;
      targetN.gentrificationRisk = Math.max(0, targetN.gentrificationRisk - 30);
      currentJustice = Math.min(100, currentJustice + 22);
      alertMessage = `🛡️ Tenant rent safeguards and social protections secured in ${targetN.name}.`;
    } 
    else if (policyType === "coolingHubs") {
      if (currentBudget < 15) {
        triggerSandboxAlert("❌ Error: Insufficient municipal budget!");
        return;
      }
      currentBudget -= 15;
      targetN.heatRisk = Math.max(0, targetN.heatRisk - 35);
      alertMessage = `❄️ Emergency cooling hubs deployed in ${targetN.name} for heatwave mitigation.`;
    }

    updatedNeighborhoods[selectedSandboxNeighborhood as keyof typeof updatedNeighborhoods] = targetN;
    setSandboxBudget(currentBudget);
    setSandboxJusticeIndex(currentJustice);
    setSandboxNeighborhoods(updatedNeighborhoods);
    if (alertMessage) triggerSandboxAlert(alertMessage);

    checkSandboxGameEnd(currentJustice, currentBudget);
  };

  const resetSandboxGame = () => {
    setSandboxBudget(100);
    setSandboxJusticeIndex(50);
    setSandboxGameStatus('playing');
    setSandboxNeighborhoods({
      molenbeek: { name: "Molenbeek", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
      ixelles: { name: "Ixelles", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 }
    });
    setSandboxAlerts(["System reset. New term started, Mayor."]);
  };

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
    : Math.round(rule.socialWeight * 100);

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
            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
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

              {/* Flashy Gradient Play as Mayor Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('sandbox')}
                  className="inline-flex items-center gap-2 px-6 py-3 font-extrabold text-white rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer"
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

            {/* City Selector & Policy Framework Archetype Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* City Switcher */}
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

              {/* Policy Rule Preset Selector */}
              <div className="lg:col-span-7">
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

            {/* Custom Sliders */}
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

            {/* Target Card with 3-Axis Radar Chart */}
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
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
      ) : activeTab === 'sandbox' ? (
        /* PLAY AS MAYOR - INTERACTIVE POLICY SANDBOX GAME */
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
          <div className="max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl mt-4 border border-slate-800 relative">
            
            {/* Game Over / Win Overlay Modal */}
            {sandboxGameStatus !== 'playing' && (
              <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-6 rounded-2xl text-center backdrop-blur-sm">
                {sandboxGameStatus === 'won' ? (
                  <>
                    <div className="text-5xl mb-4">👑🏆</div>
                    <h2 className="text-3xl font-black text-emerald-400 mb-2">Victory, Mayor!</h2>
                    <p className="text-slate-300 max-w-md mb-6 text-sm">
                      You successfully pushed the Justice Index above the 73% strategic threshold! Brussels has been transformed into a green, resilient, and socially just city.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">💀📉</div>
                    <h2 className="text-3xl font-black text-rose-500 mb-2">Game Over!</h2>
                    <p className="text-slate-300 max-w-md mb-6 text-sm">
                      Your municipal budget was depleted or social trust collapsed. Urban unrest boiled over, and you lost the election!
                    </p>
                  </>
                )}
                <button 
                  onClick={resetSandboxGame}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 font-bold text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/50">
                  Interactive Policy Sandbox
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
                  Brussels Urban Climate & Justice Simulator
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Reach 73% Justice Index to win. Balance resilience and avoid green gentrification.
                </p>
              </div>
              <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-medium">Budget</div>
                  <div className="text-xl font-bold text-emerald-400">{sandboxBudget} pts</div>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-medium">Justice Index</div>
                  <div className="text-xl font-bold text-indigo-400">{sandboxJusticeIndex}%</div>
                </div>
              </div>
            </div>

            {/* Neighborhood Selector */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Select Target District
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(sandboxNeighborhoods).map(([id, data]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedSandboxNeighborhood(id)}
                    className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                      selectedSandboxNeighborhood === id 
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg' 
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-lg">{data.name}</div>
                    <div className="text-xs text-slate-400 mt-1 flex gap-4">
                      <span>Heat Risk: <strong className="text-amber-400">{data.heatRisk}</strong></span>
                      <span>Vulnerability: <strong className="text-rose-400">{data.vulnerability}</strong></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* District Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-800/40 p-5 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Heat Stress Risk</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{activeSandboxN.heatRisk} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Green Canopy</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{activeSandboxN.greenCover}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Gentrification Risk</div>
                <div className="text-2xl font-black text-rose-400 mt-1">{activeSandboxN.gentrificationRisk}%</div>
              </div>
            </div>

            {/* Policy Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => applySandboxPolicy('greenCanopy')} 
                className="p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-emerald-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">🌿 Expand Canopy</div>
                <p className="text-xs text-slate-400 mb-3">Lowers urban heat islands via massive green infrastructure.</p>
                <span className="text-xs font-semibold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md">Cost: 30 pts</span>
              </button>

              <button 
                onClick={() => applySandboxPolicy('tenantProtection')} 
                className="p-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-indigo-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">🛡️ Rent Safeguards</div>
                <p className="text-xs text-slate-400 mb-3">Implements anti-displacement and housing price caps.</p>
                <span className="text-xs font-semibold bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-md">Cost: 20 pts</span>
              </button>

              <button 
                onClick={() => applySandboxPolicy('coolingHubs')} 
                className="p-4 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-sky-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">❄️ Cooling Hubs</div>
                <p className="text-xs text-slate-400 mb-3">Rapid pop-up emergency relief centers during heatwaves.</p>
                <span className="text-xs font-semibold bg-sky-900/60 text-sky-300 px-2.5 py-1 rounded-md">Cost: 15 pts</span>
              </button>
            </div>

            {/* Console / Alert Feed */}
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Policy Impact & System Feed
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
                {sandboxAlerts.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      msg.includes('⚠️') 
                        ? 'bg-amber-950/50 border-amber-800/60 text-amber-200' 
                        : msg.includes('❌') || msg.includes('💀')
                        ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                        : msg.includes('🎉')
                        ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                Urban Heat Priority Score = (w_heat * Heat Proxy) + [w_social * ((Age 65+ + Income Vulnerability) / 2)]
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
