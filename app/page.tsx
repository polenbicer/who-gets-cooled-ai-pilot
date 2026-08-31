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
  canopyDeficit: number; // 1 (Yüksek Yeşil/Gölge) - 5 (Ekstrem Yeşil Açığı/Betonlaşma)
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

// 3x3 Bivariate Matris Renkleri (X: Isı, Y: Sosyal Kırılganlık [Gelir + Yaş])
// Satır 0: Yüksek Sosyal, Satır 1: Orta Sosyal, Satır 2: Düşük Sosyal
export const BIVARIATE_MATRIX = [
  ['#8a5e9e', '#ad5482', '#cc3f54'], // Yüksek Sosyal: Düşük Isı, Orta Isı, Yüksek Isı
  ['#5c8b99', '#8b7d82', '#b86d6a'], // Orta Sosyal: Düşük Isı, Orta Isı, Yüksek Isı
  ['#2a9d8f', '#588a87', '#8c7478'], // Düşük Sosyal: Düşük Isı, Orta Isı, Yüksek Isı
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
    const pinsJson = JSON.stringify(
      ranked.map(item => {
        const lat = item.lat ?? REAL_COORDS[item.name]?.lat ?? center.lat;
        const lng = item.lng ?? REAL_COORDS[item.name]?.lng ?? center.lng;
        return {
          name: item.name,
          lat,
          lng,
          score: item.score.toFixed(2),
          heat: item.heat.toFixed(2),
          age: item.age.toFixed(2),
          income: item.income.toFixed(2),
          canopy: item.canopyDeficit.toFixed(2),
          profile: item.profile,
          color: item.bivariateColor,
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
          .popup-badge { display: inline-block; padding: 2px 7px; border-radius:
