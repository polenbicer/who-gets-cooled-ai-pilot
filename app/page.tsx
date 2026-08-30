'use client';

import { useEffect, useMemo, useState } from 'react';
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

// Geographic Coordinates
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

useEffect(() => {
    setData(defaultNeighbourhoods);
  }, []);

function parseNeighbourhoodCSV(csvText: string): Neighbourhood[] {
  const rawLines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length <= 1) return [];

  const firstLine = rawLines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  const parseRow = (text: string) => {
    const result: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(field.trim().replace(/^"|"$/g, ''));
        field = '';
      } else {
        field += char;
      }
    }
    result.push(field.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseRow(rawLines[0]).map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
  
  const cityIdx = headers.findIndex(h => h.includes('city') || h.includes('şehir') || h.includes('sehir'));
  const nameIdx = headers.findIndex(h => h.includes('area_name') || h.includes('area') || h.includes('name') || h.includes('neighbourhood') || h.includes('mahalle') || h.includes('ilçe') || h.includes('ilce'));
  const heatIdx = headers.findIndex(h => h.includes('relative_heat') || h.includes('heat_proxy') || h.includes('heat_score') || (h.includes('heat') && h.includes('1_5')));
  const ageIdx = headers.findIndex(h => h.includes('age_vulnerability') || h.includes('age_score') || (h.includes('age') && h.includes('1_5')));
  const incomeIdx = headers.findIndex(h => h.includes('income_vulnerability') || h.includes('income_score') || (h.includes('income') && h.includes('1_5')));
  const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('profile') || h.includes('desc'));
  const latIdx = headers.findIndex(h => h === 'lat' || h.includes('latitude'));
  const lngIdx = headers.findIndex(h => h === 'lng' || h.includes('longitude') || h === 'lon');

  const parsedItems: Neighbourhood[] = [];

  for (let i = 1; i < rawLines.length; i++) {
    const values = parseRow(rawLines[i]);
    if (values.length <= 1) continue;

    const rawCityStr = (cityIdx !== -1 ? values[cityIdx] : '').trim();
    const rawName = (nameIdx !== -1 ? values[nameIdx] : '').trim();

    if (!rawName || rawName.toLowerCase() === 'unknown') continue;

    // Kesin Şehir Eşleme
    let city: City | null = null;
    if (/amsterdam/i.test(rawCityStr)) {
      city = 'Amsterdam';
    } else if (/istanbul|i̇stanbul|ıstanbul/i.test(rawCityStr)) {
      city = 'Istanbul';
    } else if (/izmir|i̇zmir|ızmir/i.test(rawCityStr)) {
      city = 'Izmir';
    } else if (/brussel/i.test(rawCityStr)) {
      city = 'Brussels';
    } else {
      // Şehir sütununda yazmıyorsa isme göre eşle
      if (['Fatih', 'Bağcılar', 'Kadıköy', 'Sarıyer', 'Esenyurt'].includes(rawName)) city = 'Istanbul';
      else if (['Konak', 'Buca', 'Karşıyaka', 'Bornova', 'Balçova'].includes(rawName)) city = 'Izmir';
      else if (['Amsterdamse Poort e.o.', 'De Kolenkit', 'Burgwallen-Oude Zijde', 'Apollobuurt', 'Buitenveldert-West', 'Nieuw-West', 'Zuidoost', 'Noord', 'Oost', 'Centrum'].includes(rawName)) city = 'Amsterdam';
      else if (['Marolles', 'Molenbeek Historique', 'Cureghem Bara', 'Châtelain', "Vivier d'Oie", 'Schaerbeek (Helmet)', 'Matonge', 'Laeken (Centre)', 'Saint-Gilles', 'Flagey - Malibran'].includes(rawName)) city = 'Brussels';
    }

    if (!city) continue;

    const heat = heatIdx !== -1 ? (parseFloat(values[heatIdx]?.replace(',', '.')) || 1) : 1;
    const age = ageIdx !== -1 ? (parseFloat(values[ageIdx]?.replace(',', '.')) || 1) : 1;
    const income = incomeIdx !== -1 ? (parseFloat(values[incomeIdx]?.replace(',', '.')) || 1) : 1;

    let profile = notesIdx !== -1 ? values[notesIdx] : '';
    if (!profile || profile.includes('temperature.') || !isNaN(Number(profile))) {
      if (heat >= 4 && income >= 4) profile = 'High heat + income vulnerability';
      else if (age >= 4) profile = 'Age vulnerability + lower heat';
      else if (income >= 4) profile = 'Income vulnerability + lower heat';
      else profile = 'Moderate socio-spatial risk';
    }

    parsedItems.push({
      city,
      name: rawName,
      heat,
      age,
      income,
      profile,
      lat: latIdx !== -1 && values[latIdx] ? parseFloat(values[latIdx].replace(',', '.')) : undefined,
      lng: lngIdx !== -1 && values[lngIdx] ? parseFloat(values[lngIdx].replace(',', '.')) : undefined,
    });
  }

  return parsedItems;
}

const scenarios: Record<Scenario, { label: string; heatWeight: number; socialWeight: number; note: string }> = {
  heat: { label: 'Heat-first', heatWeight: 0.7, socialWeight: 0.3, note: 'Prioritises physical heat exposure and surface temperature anomalies.' },
  balanced: { label: 'Balanced', heatWeight: 0.5, socialWeight: 0.5, note: 'Gives equal normative weight to thermal risk and demographic vulnerability.' },
  justice: { label: 'Justice-first', heatWeight: 0.3, socialWeight: 0.7, note: 'Prioritises socio-economic inequality and elderly isolation in cooling allocation.' },
};

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

  // What-If Interventions
  const [applyTrees, setApplyTrees] = useState<boolean>(false);
  const [applyShelter, setApplyShelter] = useState<boolean>(false);
  const [applyRetrofit, setApplyRetrofit] = useState<boolean>(false);

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const parsed = parseNeighbourhoodCSV(csvText);
        if (parsed.length > 0) {
          // Her şehir için kontrol et: Canlıda varsa onu, yoksa varsayılanı koy
          const cities: City[] = ['Brussels', 'Amsterdam', 'Istanbul', 'Izmir'];
          const finalData: Neighbourhood[] = [];

          cities.forEach(c => {
            const cityParsed = parsed.filter(item => item.city === c);
            if (cityParsed.length > 0) {
              finalData.push(...cityParsed);
            } else {
              finalData.push(...defaultNeighbourhoods.filter(item => item.city === c));
            }
          });

          setData(finalData);
        }
      })
      .catch(err => {
        console.error('Error fetching live Google Sheet, using fallback:', err);
        setData(defaultNeighbourhoods);
      });
  }, []);

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
          calculatedScore = (effectiveHeat * (heatWeight / 100)) + (effectiveAge * (ageWeight / 100)) + (effectiveIncome * (incomeWeight / 100));
        } else {
          const social = (effectiveAge + effectiveIncome) / 2;
          const rule = scenarios[scenario];
          calculatedScore = effectiveHeat * rule.heatWeight + social * rule.socialWeight;
        }

        return {
          ...area,
          effectiveHeat,
          effectiveAge,
          effectiveIncome,
          social: (effectiveAge + effectiveIncome) / 2,
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
      { metric: 'Heat Proxy', target: top.heat, average: Number(avgHeat.toFixed(2)), fullMark: 5 },
      { metric: 'Elderly (65+)', target: top.age, average: Number(avgAge.toFixed(2)), fullMark: 5 },
      { metric: 'Low Income', target: top.income, average: Number(avgIncome.toFixed(2)), fullMark: 5 },
    ];
  }, [top, ranked]);

  const mapHtml = useMemo(() => {
    const center = CITY_CENTERS[city] || CITY_CENTERS.Brussels;
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

          {/* POLICY CONTROL DECK (4 Cities) */}
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

            {/* Top Row: Cities (4 Pills) & Policy Rules */}
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
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
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

            {/* Dynamic Political Shift Insight Banner */}
            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-rose-700 flex items-center gap-1"><Flame className="size-3.5" /> {isCustomWeights ? heatWeight : Math.round(rule.heatWeight * 100)}% Heat Weight</span>
                <span className="text-stone-300">|</span>
                <span className="font-bold text-slate-800 flex items-center gap-1"><Users className="size-3.5" /> {isCustomWeights ? (ageWeight + incomeWeight) : Math.round(rule.socialWeight * 100)}% Social Weight</span>
              </div>
              <div className="text-stone-600 text-[11px] font-medium flex items-center gap
            