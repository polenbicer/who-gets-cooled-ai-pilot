"use client";

import React, { useMemo, useState } from "react";
import GameRedesign from "./redesign";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Flame,
  Scale,
  Users,
  HeartHandshake,
  Landmark,
  Bot,
  Sparkles,
  Check,
  Lock,
  Activity,
} from "lucide-react";

type CityKey = "Brussels" | "Amsterdam" | "Istanbul" | "Izmir";

type District = {
  name: string;
  score: number;
  lat: number;
  lng: number;
  description: string;
  heat: number;
  poverty: number;
  elderly: number;
  housing: number;
  green: number;
  population: string;
  polygon: [number, number][];
};

type Choice = {
  title: string;
  icon: string;
  body: string;
  effects: string;
  cost: number;
  apply: (s: Stats) => Stats;
};

type Stats = {
  budget: number;
  heat: number;
  justice: number;
  approval: number;
  trust: number;
  council: number;
  green: number;
  health: number;
  lives: number;
};

const CITY_DATA: Record<CityKey, {
  country: string;
  flag: string;
  subtitle: string;
  center: [number, number];
  zoom: number;
  districts: District[];
}> = {
  Istanbul: {
    country: "Türkiye",
    flag: "🇹🇷",
    subtitle: "Extreme density / northern green belt",
    center: [41.0500, 28.9600],
    zoom: 11,
    districts: [
      {
        name: "Bağcılar",
        score: 96,
        lat: 41.0400,
        lng: 28.8475,
        description: "Dense concrete core with minimal green buffers and critical summer thermal traps.",
        heat: 96,
        poverty: 84,
        elderly: 27,
        housing: 91,
        green: 14,
        population: "742K",
        polygon: [
          [41.065, 28.815],
          [41.060, 28.875],
          [41.020, 28.865],
          [41.025, 28.810],
        ],
      },
      {
        name: "Esenler",
        score: 91,
        lat: 41.0500,
        lng: 28.8850,
        description: "High residential density adjacent to major highways; severe urban heat island exposure.",
        heat: 91,
        poverty: 81,
        elderly: 30,
        housing: 88,
        green: 18,
        population: "445K",
        polygon: [
          [41.075, 28.870],
          [41.070, 28.910],
          [41.030, 28.900],
          [41.035, 28.860],
        ],
      },
      {
        name: "Fatih",
        score: 93,
        lat: 41.0182,
        lng: 28.9437,
        description: "Historic peninsula with low canopy, intense transit load and vulnerable aging housing.",
        heat: 93,
        poverty: 69,
        elderly: 44,
        housing: 86,
        green: 16,
        population: "368K",
        polygon: [
          [41.035, 28.925],
          [41.030, 28.985],
          [40.995, 28.975],
          [41.000, 28.920],
        ],
      },
      {
        name: "Kadıköy",
        score: 74,
        lat: 40.9910,
        lng: 29.0270,
        description: "High coastal elderly demographics, dense mid-rise apartments and rising nighttime heat.",
        heat: 78,
        poverty: 48,
        elderly: 43,
        housing: 74,
        green: 39,
        population: "482K",
        polygon: [
          [41.010, 29.010],
          [41.005, 29.075],
          [40.965, 29.085],
          [40.960, 29.020],
        ],
      },
      {
        name: "Üsküdar",
        score: 67,
        lat: 41.0250,
        lng: 29.0550,
        description: "Steep topography and mixed canopy; pockets of elderly vulnerability in inner neighborhoods.",
        heat: 70,
        poverty: 45,
        elderly: 46,
        housing: 67,
        green: 48,
        population: "525K",
        polygon: [
          [41.060, 29.030],
          [41.055, 29.095],
          [41.005, 29.085],
          [41.010, 29.025],
        ],
      },
      {
        name: "Northern Belt",
        score: 39,
        lat: 41.1680,
        lng: 29.0550,
        description: "Forested northern reservoir perimeter with low surface temperatures and high canopy.",
        heat: 42,
        poverty: 32,
        elderly: 25,
        housing: 38,
        green: 86,
        population: "180K",
        polygon: [
          [41.210, 28.950],
          [41.200, 29.150],
          [41.130, 29.130],
          [41.140, 28.970],
        ],
      },
    ],
  },
  Brussels: {
    country: "Belgium",
    flag: "🇧🇪",
    subtitle: "Canal corridor / socio-spatial polarization",
    center: [50.8450, 4.3600],
    zoom: 12,
    districts: [
      {
        name: "Molenbeek",
        score: 88,
        lat: 50.8546,
        lng: 4.3340,
        description: "Dense housing along the canal corridor with severe lack of tree canopy.",
        heat: 91,
        poverty: 86,
        elderly: 34,
        housing: 89,
        green: 22,
        population: "98K",
        polygon: [
          [50.868, 4.310],
          [50.865, 4.350],
          [50.840, 4.340],
          [50.845, 4.305],
        ],
      },
      {
        name: "Marolles",
        score: 88,
        lat: 50.8385,
        lng: 4.3468,
        description: "Historic central core with heavy impervious surfaces and low-income housing.",
        heat: 88,
        poverty: 79,
        elderly: 42,
        housing: 76,
        green: 27,
        population: "42K",
        polygon: [
          [50.848, 4.335],
          [50.845, 4.360],
          [50.830, 4.355],
          [50.832, 4.330],
        ],
      },
      {
        name: "Saint-Josse",
        score: 90,
        lat: 50.8500,
        lng: 4.3700,
        description: "Extreme density and thermal traps in compact pre-war blocks.",
        heat: 90,
        poverty: 86,
        elderly: 29,
        housing: 81,
        green: 20,
        population: "28K",
        polygon: [
          [50.860, 4.360],
          [50.858, 4.385],
          [50.845, 4.380],
          [50.847, 4.355],
        ],
      },
      {
        name: "Ixelles",
        score: 75,
        lat: 50.8242,
        lng: 4.3601,
        description: "Dense pavement around Flagey with high student and elderly concentration.",
        heat: 79,
        poverty: 64,
        elderly: 39,
        housing: 77,
        green: 38,
        population: "87K",
        polygon: [
          [50.838, 4.350],
          [50.835, 4.385],
          [50.810, 4.380],
          [50.812, 4.345],
        ],
      },
      {
        name: "Châtelain",
        score: 52,
        lat: 50.8200,
        lng: 4.3580,
        description: "Affluent residential neighborhood with private courtyard vegetation.",
        heat: 58,
        poverty: 32,
        elderly: 28,
        housing: 50,
        green: 55,
        population: "34K",
        polygon: [
          [50.828, 4.345],
          [50.825, 4.370],
          [50.808, 4.365],
          [50.810, 4.340],
        ],
      },
      {
        name: "Vivier d'Oie",
        score: 36,
        lat: 50.7892,
        lng: 4.3755,
        description: "Bordering Sonian Forest; extensive canopy cover and minimal surface thermal stress.",
        heat: 40,
        poverty: 27,
        elderly: 44,
        housing: 49,
        green: 81,
        population: "22K",
        polygon: [
          [50.805, 4.360],
          [50.800, 4.400],
          [50.775, 4.390],
          [50.780, 4.350],
        ],
      },
    ],
  },
  Amsterdam: {
    country: "Netherlands",
    flag: "🇳🇱",
    subtitle: "Canal city / water-edge heat islands",
    center: [52.3600, 4.8900],
    zoom: 12,
    districts: [
      {
        name: "Nieuw-West",
        score: 86,
        lat: 52.3680,
        lng: 4.8100,
        description: "Post-war residential blocks with wide paved plazas and energy poverty.",
        heat: 89,
        poverty: 78,
        elderly: 38,
        housing: 84,
        green: 34,
        population: "160K",
        polygon: [
          [52.385, 4.780],
          [52.380, 4.840],
          [52.345, 4.835],
          [52.350, 4.775],
        ],
      },
      {
        name: "Burgwallen",
        score: 81,
        lat: 52.3718,
        lng: 4.8980,
        description: "Historic masonry core; narrow alleys and high visitor footfall create nocturnal heat traps.",
        heat: 86,
        poverty: 65,
        elderly: 41,
        housing: 75,
        green: 20,
        population: "48K",
        polygon: [
          [52.380, 4.885],
          [52.378, 4.915],
          [52.360, 4.910],
          [52.362, 4.880],
        ],
      },
      {
        name: "Zuidoost",
        score: 82,
        lat: 52.3145,
        lng: 4.9542,
        description: "High-rise social housing clusters near transit nodes.",
        heat: 86,
        poverty: 73,
        elderly: 35,
        housing: 80,
        green: 39,
        population: "90K",
        polygon: [
          [52.330, 4.930],
          [52.325, 4.985],
          [52.295, 4.975],
          [52.300, 4.920],
        ],
      },
      {
        name: "Indische Buurt",
        score: 76,
        lat: 52.3650,
        lng: 4.9380,
        description: "Dense 19th-century fabric in East Amsterdam with elderly isolation.",
        heat: 76,
        poverty: 74,
        elderly: 69,
        housing: 63,
        green: 31,
        population: "32K",
        polygon: [
          [52.375, 4.925],
          [52.372, 4.955],
          [52.355, 4.950],
          [52.358, 4.920],
        ],
      },
      {
        name: "Noord",
        score: 69,
        lat: 52.3950,
        lng: 4.9100,
        description: "Transforming post-industrial waterfront with uneven tree canopy.",
        heat: 72,
        poverty: 55,
        elderly: 40,
        housing: 68,
        green: 46,
        population: "102K",
        polygon: [
          [52.415, 4.880],
          [52.410, 4.945],
          [52.385, 4.935],
          [52.390, 4.870],
        ],
      },
      {
        name: "Zuid",
        score: 38,
        lat: 52.3380,
        lng: 4.8720,
        description: "Affluent district with wide avenues and insulated infrastructure.",
        heat: 42,
        poverty: 25,
        elderly: 47,
        housing: 46,
        green: 78,
        population: "145K",
        polygon: [
          [52.355, 4.850],
          [52.350, 4.900],
          [52.320, 4.890],
          [52.325, 4.840],
        ],
      },
    ],
  },
  Izmir: {
    country: "Türkiye",
    flag: "🇹🇷",
    subtitle: "Aegean bay / dry summer exposure",
    center: [38.4200, 27.1400],
    zoom: 12,
    districts: [
      {
        name: "Konak",
        score: 94,
        lat: 38.4189,
        lng: 27.1287,
        description: "Dense commercial and historic waterfront core with heavy asphalt paving.",
        heat: 94,
        poverty: 68,
        elderly: 61,
        housing: 72,
        green: 21,
        population: "344K",
        polygon: [
          [38.435, 27.110],
          [38.430, 27.155],
          [38.405, 27.150],
          [38.410, 27.105],
        ],
      },
      {
        name: "Buca",
        score: 92,
        lat: 38.3850,
        lng: 27.1750,
        description: "Fast-growing hillside district with dense apartment corridors.",
        heat: 94,
        poverty: 78,
        elderly: 34,
        housing: 87,
        green: 23,
        population: "522K",
        polygon: [
          [38.405, 27.155],
          [38.400, 27.200],
          [38.365, 27.190],
          [38.370, 27.145],
        ],
      },
      {
        name: "Karabağlar",
        score: 90,
        lat: 38.3750,
        lng: 27.1250,
        description: "High residential density, informal expansions and low shade buffers.",
        heat: 92,
        poverty: 81,
        elderly: 39,
        housing: 86,
        green: 21,
        population: "478K",
        polygon: [
          [38.395, 27.100],
          [38.390, 27.145],
          [38.355, 27.140],
          [38.360, 27.095],
        ],
      },
      {
        name: "Bornova",
        score: 78,
        lat: 38.4650,
        lng: 27.2180,
        description: "Inland valley basin with high daytime thermal load.",
        heat: 81,
        poverty: 58,
        elderly: 35,
        housing: 74,
        green: 34,
        population: "450K",
        polygon: [
          [38.485, 27.195],
          [38.480, 27.245],
          [38.445, 27.235],
          [38.450, 27.185],
        ],
      },
      {
        name: "Karşıyaka",
        score: 61,
        lat: 38.4590,
        lng: 27.1100,
        description: "Coastal waterfront district with cooling breeze but elderly demographics.",
        heat: 66,
        poverty: 43,
        elderly: 46,
        housing: 63,
        green: 47,
        population: "350K",
        polygon: [
          [38.475, 27.085],
          [38.470, 27.135],
          [38.440, 27.130],
          [38.445, 27.080],
        ],
      },
      {
        name: "Urla Belt",
        score: 35,
        lat: 38.3220,
        lng: 26.7650,
        description: "Peripheral coastal green corridor with olive groves and natural ventilation.",
        heat: 39,
        poverty: 29,
        elderly: 42,
        housing: 41,
        green: 82,
        population: "74K",
        polygon: [
          [38.350, 26.730],
          [38.345, 26.800],
          [38.295, 26.790],
          [38.300, 26.720],
        ],
      },
    ],
  },
};

const EVENT_NAMES = [
  "Heatwave Forecast",
  "Elderly Isolation Crisis",
  "Developer Capital Inflow",
  "Algorithm Blind Spot",
  "Tenant Rent Protest",
  "Social Housing Crisis",
  "Power Grid Brownout",
  "Audit Media Scandal",
  "Fiscal Cut Pressure",
  "City Council Showdown",
  "Hospital Surge Alert",
  "Election Day Verdict",
];

const CHOICES_PER_TURN: Record<number, Choice[]> = {
  1: [
    {
      title: "Deploy Emergency Cooling Shelters",
      icon: "💧",
      body: "Convert libraries and municipal gyms into free climate-controlled respite hubs.",
      effects: "Heat −5 · Health +8 · Approval +7 · Justice +5",
      cost: 12,
      apply: (s) => ({ ...s, heat: Math.max(0, s.heat - 5), health: Math.min(100, s.health + 8), approval: Math.min(100, s.approval + 7), justice: Math.min(100, s.justice + 5), lives: s.lives + 120 }),
    },
    {
      title: "Emergency Household AC Subsidy",
      icon: "❄️",
      body: "Subsidize electricity bills directly for low-income residents running cooling appliances.",
      effects: "Heat −7 · Approval +9 · Health +6 · Justice −2",
      cost: 18,
      apply: (s) => ({ ...s, heat: Math.max(0, s.heat - 7), approval: Math.min(100, s.approval + 9), health: Math.min(100, s.health + 6), justice: Math.max(0, s.justice - 2), lives: s.lives + 95 }),
    },
    {
      title: "Fast-Track Shading & Urban Canopy",
      icon: "🌳",
      body: "Redirect municipal workforces to install shade sails, cool pavements, and tree pits.",
      effects: "Heat −10 · Green +10 · Justice +6 · Council −4",
      cost: 25,
      apply: (s) => ({ ...s, heat: Math.max(0, s.heat - 10), green: Math.min(100, s.green + 10), justice: Math.min(100, s.justice + 6), council: Math.max(0, s.council - 4), lives: s.lives + 140 }),
    },
    {
      title: "Hold the Fiscal Line",
      icon: "🧊",
      body: "Keep municipal reserves untouched and rely strictly on routine dispatch services.",
      effects: "Budget +0 · Approval −8 · Trust −7 · Heat +4",
      cost: 0,
      apply: (s) => ({ ...s, approval: Math.max(0, s.approval - 8), trust: Math.max(0, s.trust - 7), heat: Math.min(100, s.heat + 4), lives: s.lives + 15 }),
    },
  ],
  4: [
    {
      title: "Audit the AI system",
      icon: "⚖️",
      body: "Launch an independent audit and publish priority training weights publicly before the next run.",
      effects: "Justice +15 · Trust +10 · Health +4",
      cost: 12,
      apply: (s) => ({ ...s, justice: Math.min(100, s.justice + 15), trust: Math.min(100, s.trust + 10), health: Math.min(100, s.health + 4), lives: s.lives + 80 }),
    },
    {
      title: "Increase dataset diversity",
      icon: "📊",
      body: "Invest in ground-level sensor arrays and community reporting in overlooked informal areas.",
      effects: "Justice +10 · Approval +8 · Green +3",
      cost: 18,
      apply: (s) => ({ ...s, justice: Math.min(100, s.justice + 10), approval: Math.min(100, s.approval + 8), green: Math.min(100, s.green + 3), lives: s.lives + 105 }),
    },
    {
      title: "Trust the system",
      icon: "🤖",
      body: "AI is generally right. Keep model parameters unchanged to preserve fiscal capacity.",
      effects: "Budget +0 · Trust −10 · Justice −8",
      cost: 0,
      apply: (s) => ({ ...s, trust: Math.max(0, s.trust - 10), justice: Math.max(0, s.justice - 8), lives: s.lives + 20 }),
    },
    {
      title: "Blame the vendors",
      icon: "📣",
      body: "Hold a press conference and shift algorithmic accountability strictly to the contractor.",
      effects: "Approval +5 · Trust −5 · Council +2",
      cost: 4,
      apply: (s) => ({ ...s, approval: Math.min(100, s.approval + 5), trust: Math.max(0, s.trust - 5), council: Math.min(100, s.council + 2), lives: s.lives + 30 }),
    },
    {
      title: "Community panel oversight",
      icon: "👥",
      body: "Create a citizen jury to co-decide automated cooling funds alongside engineers.",
      effects: "Approval +10 · Trust +8 · Budget −6",
      cost: 6,
      apply: (s) => ({ ...s, approval: Math.min(100, s.approval + 10), trust: Math.min(100, s.trust + 8), council: Math.max(0, s.council - 6), lives: s.lives + 70 }),
    },
  ],
};

function getChoicesForTurn(turn: number): Choice[] {
  if (CHOICES_PER_TURN[turn]) return CHOICES_PER_TURN[turn];
  return [
    {
      title: "Target Marginalized Hotspots",
      icon: "🎯",
      body: "Focus all available cooling interventions on top-ranked vulnerability zones.",
      effects: "Justice +12 · Trust +8 · Heat −6",
      cost: 14,
      apply: (s) => ({ ...s, justice: Math.min(100, s.justice + 12), trust: Math.min(100, s.trust + 8), heat: Math.max(0, s.heat - 6), lives: s.lives + 110 }),
    },
    {
      title: "Citywide Uniform Cooling Plan",
      icon: "🌐",
      body: "Distribute resources equally across all districts to minimize council backlash.",
      effects: "Approval +8 · Council +6 · Justice −4",
      cost: 16,
      apply: (s) => ({ ...s, approval: Math.min(100, s.approval + 8), council: Math.min(100, s.council + 6), justice: Math.max(0, s.justice - 4), lives: s.lives + 65 }),
    },
    {
      title: "Private-Public Green Concession",
      icon: "🏢",
      body: "Partner with corporate developers to fund shaded green parks with commercial concessions.",
      effects: "Budget +15 · Council +8 · Justice −6",
      cost: 0,
      apply: (s) => ({ ...s, budget: Math.min(100, s.budget + 15), council: Math.min(100, s.council + 8), justice: Math.max(0, s.justice - 6), lives: s.lives + 40 }),
    },
    {
      title: "Enact Anti-Gentrification Rent Caps",
      icon: "🛡️",
      body: "Prevent green displacement in newly shaded low-income neighborhoods.",
      effects: "Justice +16 · Approval +10 · Council −8",
      cost: 8,
      apply: (s) => ({ ...s, justice: Math.min(100, s.justice + 16), approval: Math.min(100, s.approval + 10), council: Math.max(0, s.council - 8), lives: s.lives + 75 }),
    },
  ];
}

function tone(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function toneColor(t: string): string {
  if (t === "critical") return "#ef4444";
  if (t === "high") return "#f97316";
  if (t === "medium") return "#eab308";
  return "#22c55e";
}

export default function MayorGamePage() {
  return <GameRedesign cityData={CITY_DATA} getChoices={getChoicesForTurn} />;
}

export function LegacyMayorGamePage() {
  const [city, setCity] = useState<CityKey>("Istanbul");
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);
  const [turn, setTurn] = useState(4);
  const [chosen, setChosen] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    budget: 62,
    heat: 72,
    justice: 54,
    approval: 58,
    trust: 63,
    council: 46,
    green: 38,
    health: 56,
    lives: 1248,
  });
  const [log, setLog] = useState<string[]>([
    "Turn 1: Deployed emergency cooling shelters in working-class corridors.",
    "Turn 2: Funded neighbor check-in networks for isolated elderly citizens.",
    "Turn 3: Implemented climate requirements on private development deals.",
  ]);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);

  const cityObj = CITY_DATA[city];
  const activeDistrict = cityObj.districts[selectedDistrictIndex] || cityObj.districts[0];
  const currentChoices = getChoicesForTurn(turn);

  const stakeholderMood = useMemo(() => ({
    Citizens: Math.round((stats.approval + stats.trust) / 2),
    Activists: stats.justice,
    Developers: Math.min(100, Math.max(0, stats.council + 15)),
    Media: Math.min(100, Math.max(0, stats.approval - 11)),
    Council: stats.council,
  }), [stats]);

  const handleCityChange = (newCity: CityKey) => {
    setCity(newCity);
    setSelectedDistrictIndex(0);
  };

  const chooseOption = (index: number) => {
    if (chosen !== null) return;
    const c = currentChoices[index];
    if (c.cost > stats.budget) {
      alert("❌ Insufficient budget! Choose another policy or adjust fiscal priorities.");
      return;
    }
    const newStats = c.apply({ ...stats, budget: stats.budget - c.cost });
    setStats(newStats);
    setChosen(index);
    setLog((prev) => [`Turn ${turn} (${city}): ${c.title}`, ...prev]);

    if (newStats.budget <= 0 || turn >= 12) {
      setShowEndModal(true);
    }
  };

  const nextTurn = () => {
    if (chosen === null) return;
    if (turn >= 12 || stats.budget <= 0) {
      setShowEndModal(true);
      return;
    }
    setTurn((t) => t + 1);
    setChosen(null);
    setStats((s) => ({
      ...s,
      budget: Math.max(0, s.budget - 2),
      heat: Math.min(100, Math.max(0, s.heat + (turn % 3 === 0 ? 3 : -1))),
      approval: Math.min(100, Math.max(0, s.approval + (s.trust > 60 ? 1 : -1))),
    }));
  };

  const resetGame = () => {
    setTurn(1);
    setChosen(null);
    setStats({
      budget: 100,
      heat: 68,
      justice: 50,
      approval: 60,
      trust: 60,
      council: 55,
      green: 35,
      health: 55,
      lives: 850,
    });
    setLog(["Mayoral term initiated. Select a district and govern."]);
    setShowEndModal(false);
    setShowIntroModal(false);
  };

  const mapHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin:0; padding:0; height:100%; width:100%; background:#070f17; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map { height:100%; width:100%; background:#070f17; }
    .custom-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .pin-circle {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.8);
      transition: transform 0.2s ease;
    }
    .pin-circle:hover { transform: scale(1.18); }
    .pin-label {
      background: rgba(15,23,42,0.9);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 5px;
      margin-bottom: 4px;
      border: 1px solid rgba(255,255,255,0.25);
      white-space: nowrap;
      text-shadow: 0 1px 3px #000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .leaflet-control-attribution { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${cityObj.center[0]}, ${cityObj.center[1]}], ${cityObj.zoom});
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    }).addTo(map);

    const districts = ${JSON.stringify(cityObj.districts)};

    districts.forEach((d, idx) => {
      const color = d.score >= 85 ? '#ef4444' : d.score >= 65 ? '#f97316' : d.score >= 50 ? '#eab308' : '#22c55e';
      
      if (d.polygon && d.polygon.length > 0) {
        L.polygon(d.polygon, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.45,
          dashArray: '3, 4'
        }).addTo(map);
      }

      const icon = L.divIcon({
        className: 'custom-pin-container',
        html: '<div class="custom-pin">' +
                '<div class="pin-label">' + d.name + '</div>' +
                '<div class="pin-circle" style="background:' + color + ';">' + d.score + '</div>' +
              '</div>',
        iconSize: [60, 60],
        iconAnchor: [30, 48]
      });

      L.marker([d.lat, d.lng], { icon: icon }).addTo(map);
    });
  </script>
</body>
</html>`;
  }, [cityObj]);

  return (
    <div className="min-h-screen bg-[#060a0f] text-slate-100 font-sans antialiased select-none flex flex-col justify-between overflow-x-hidden">
      
      {/* INTRO MODAL */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0d1520] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="size-3.5" /> Mayor Executive Simulation Manual
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Who Gets Cooled? <br />
              <span className="text-[#c2410c]">Survive the Climate &amp; Political Crisis</span>
            </h1>
            <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                Welcome, Mayor. Your metropolis is gripped by dangerous heatwaves, tenant rent pressures, and automated allocation algorithms.
              </p>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 shrink-0">💰 Budget &amp; Game End:</span>
                  <span>
                    To complete your term and evaluate your mayoral legacy, you must strategically utilize your <strong>municipal budget</strong> across <strong>12 turns</strong>. Depleting funds without achieving resilience leads to bankruptcy and election defeat!
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-400 shrink-0">⚖️ Spatial Justice:</span>
                  <span>
                    Cooling only affluent centers while ignoring marginalized districts will trigger <em>Green Gentrification</em> and widespread social unrest.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
              <a href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer">
                <ArrowLeft className="size-4" /> Exit to Dashboard
              </a>
              <button
                onClick={() => setShowIntroModal(false)}
                className="px-6 py-3 rounded-xl bg-[#c2410c] hover:bg-[#a9370a] text-white font-black text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer"
              >
                Enter Mayor's Office →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#0d1520] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center">
            <div className="text-5xl mb-3">👑</div>
            <h2 className="text-3xl font-black text-white">Mayoral Term Concluded</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              {stats.budget <= 0
                ? "Your municipal treasury is fully depleted! The city's governance and climate record are now judged by voters."
                : "You successfully steered the metropolis through the 12-turn climate crisis. Your administrative legacy is certified."}
            </p>

            <div className="grid grid-cols-3 gap-3 my-6 text-left">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400">Justice Index</div>
                <div className="text-xl font-bold text-indigo-400">{stats.justice}%</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400">Public Approval</div>
                <div className="text-xl font-bold text-emerald-400">{stats.approval}%</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400">Lives Saved</div>
                <div className="text-xl font-bold text-amber-400">{stats.lives.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200 mb-6">
              <strong>Your Mayoral Legacy: </strong>
              {stats.justice >= 65
                ? "Social Justice Champion — You prioritized low-income frontline communities and prevented green gentrification."
                : "Technocratic Adaptation Leader — The city reduced heat stress, but socio-spatial disparities widened across marginalized sectors."}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-[#c2410c] hover:bg-[#a9370a] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Play Again
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TOP STATS BAR WITH RELIABLE DIRECT A-HREF BACK TO DASHBOARD BUTTON */}
      <header className="h-16 border-b border-slate-800/90 bg-[#090e15] px-4 md:px-6 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-max">
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </a>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-200">
              TURN {turn} / 12
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {EVENT_NAMES[turn - 1]}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-amber-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Budget</div>
              <div className="text-xs font-black text-amber-300 font-mono">{stats.budget}M €</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="size-4 text-rose-500" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Heat</div>
              <div className="text-xs font-black text-rose-400 font-mono">{stats.heat} <span className="text-[9px] text-slate-500">/100</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Scale className="size-4 text-indigo-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Justice</div>
              <div className="text-xs font-black text-indigo-300 font-mono">{stats.justice} <span className="text-[9px] text-slate-500">/100</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="size-4 text-sky-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Approval</div>
              <div className="text-xs font-black text-sky-300 font-mono">{stats.approval} <span className="text-[9px] text-slate-500">/100</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-emerald-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Trust</div>
              <div className="text-xs font-black text-emerald-300 font-mono">{stats.trust} <span className="text-[9px] text-slate-500">/100</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-orange-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Council</div>
              <div className="text-xs font-black text-orange-300 font-mono">{stats.council} <span className="text-[9px] text-slate-500">/100</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIntroModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs font-bold hover:bg-indigo-900 transition-all cursor-pointer"
          >
            <Bot className="size-3.5" /> AI Advisor
          </button>
        </div>
      </header>

      {/* COCKPIT WORKSPACE */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* LEFT COLUMN: CITY SELECTOR & DISTRICT LIST */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* CITY SELECTOR */}
          <div className="bg-[#0b1219] border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Select City Context
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(Object.keys(CITY_DATA) as CityKey[]).map((cKey) => {
                const active = city === cKey;
                return (
                  <button
                    key={cKey}
                    onClick={() => handleCityChange(cKey)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-[#c2410c] text-white shadow-md ring-1 ring-orange-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{CITY_DATA[cKey].flag}</span>
                    <span className="truncate">{cKey}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>{city.toUpperCase()}</span>
                <span className="text-[11px] font-normal text-slate-400 truncate">{cityObj.subtitle}</span>
              </div>
            </div>
          </div>

          {/* District Risk Overview */}
          <div className="bg-[#0b1219] border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>District Risk Overview</span>
              <Activity className="size-3.5 text-rose-400" />
            </div>
            <div className="space-y-1.5">
              {cityObj.districts.map((d, idx) => {
                const t = tone(d.score);
                const isSelected = selectedDistrictIndex === idx;
                return (
                  <button
                    key={d.name}
                    onClick={() => setSelectedDistrictIndex(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-orange-500 shadow-md ring-1 ring-orange-500"
                        : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ backgroundColor: toneColor(t) }}
                      >
                        {d.score}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{d.name}</span>
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: toneColor(t) }}
                    >
                      {t === "critical" ? "Very High" : t.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stakeholder Mood */}
          <div className="bg-[#0b1219] border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">
              Stakeholder Mood
            </div>
            <div className="space-y-2">
              {Object.entries(stakeholderMood).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${val}%`,
                          backgroundColor: val > 60 ? "#22c55e" : val > 40 ? "#f97316" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-300 w-6 text-right">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: LEAFLET SATELLITE MAP */}
        <div className="lg:col-span-6 relative">
          <div className="relative h-[620px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#070f17]">
            
            {/* Risk Legend */}
            <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-3">
              <span className="text-slate-400 uppercase tracking-wider">Risk Level:</span>
              <span className="flex items-center gap-1 text-emerald-400"><i className="size-2 rounded-full bg-emerald-500" /> Low</span>
              <span className="flex items-center gap-1 text-amber-400"><i className="size-2 rounded-full bg-amber-500" /> Medium</span>
              <span className="flex items-center gap-1 text-orange-400"><i className="size-2 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1 text-rose-400"><i className="size-2 rounded-full bg-rose-500" /> Very High</span>
            </div>

            {/* Satellite Map iframe */}
            <iframe
              key={city}
              title="Satellite Simulation Map"
              srcDoc={mapHtml}
              className="w-full h-full border-0"
            />

            {/* Selected District Overlay Box */}
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    {activeDistrict.name.toUpperCase()}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${toneColor(tone(activeDistrict.score))}25`,
                        color: toneColor(tone(activeDistrict.score)),
                        border: `1px solid ${toneColor(tone(activeDistrict.score))}50`,
                      }}
                    >
                      {tone(activeDistrict.score) === "critical" ? "Very High Risk" : `${tone(activeDistrict.score).toUpperCase()} RISK`}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeDistrict.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Heat Risk</span>
                  <span className="font-bold text-rose-400">{activeDistrict.heat}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Poverty</span>
                  <span className="font-bold text-amber-400">{activeDistrict.poverty}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Housing</span>
                  <span className="font-bold text-sky-400">{activeDistrict.housing}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Population</span>
                  <span className="font-bold text-emerald-400">{activeDistrict.population}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EVENT & DECISION CARDS WITH PROMINENT NEXT BUTTON */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#0b1219] border border-orange-500/30 rounded-2xl p-4 shadow-xl">
            
            <div className="text-[10px] uppercase font-black tracking-wider text-orange-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="size-3" /> Current Event · {cityObj.flag} {city}
            </div>
            
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {EVENT_NAMES[turn - 1]}
            </h2>
            
            <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-4">
              {turn === 4
                ? "Your AI model failed to detect rapid thermal buildup in low-income tenant blocks. Citizen coalitions demand transparent intervention."
                : `Extreme microclimate alerts triggered for ${activeDistrict.name}. Council and media await immediate response.`}
            </p>

            <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Choose your policy response:
            </div>

            <div className="space-y-2">
              {currentChoices.map((choice, i) => {
                const isChosen = chosen === i;
                const isMuted = chosen !== null && !isChosen;
                const isAffordable = stats.budget >= choice.cost;

                return (
                  <button
                    key={choice.title}
                    disabled={chosen !== null || !isAffordable}
                    onClick={() => chooseOption(i)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isChosen
                        ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-400"
                        : isMuted
                        ? "opacity-35 bg-slate-900 border-slate-800"
                        : !isAffordable
                        ? "opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed"
                        : "bg-slate-900/80 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{choice.icon}</span>
                        <span className="text-xs font-bold text-white">{choice.title}</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-emerald-400 px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-800/40">
                        {choice.cost === 0 ? "FREE" : `Cost: ${choice.cost}M €`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{choice.body}</p>
                    <div className="mt-2 text-[9px] font-bold text-indigo-300">{choice.effects}</div>
                  </button>
                );
              })}
            </div>

            {/* PROMINENT NEXT TURN ACTION BUTTON */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={nextTurn}
                disabled={chosen === null}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                  chosen !== null
                    ? "bg-[#c2410c] hover:bg-[#a9370a] text-white animate-pulse cursor-pointer ring-2 ring-orange-400"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                }`}
              >
                <span>{chosen !== null ? "CONFIRM & NEXT TURN" : "SELECT A POLICY TO ADVANCE"}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>

            {/* Decision Log */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Decision Log
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto text-[10px] font-mono text-slate-400">
                {log.map((item, idx) => (
                  <div key={idx} className="truncate">✓ {item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GAME TIMELINE */}
      <div className="max-w-[1700px] w-full mx-auto px-4 my-2">
        <div className="bg-[#090e15] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-1 overflow-x-auto">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 shrink-0">
            Game Timeline
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            {EVENT_NAMES.map((name, i) => {
              const turnNum = i + 1;
              const isCurrent = turn === turnNum;
              const isPassed = turn > turnNum;

              return (
                <div
                  key={name}
                  className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? "bg-indigo-900/60 border-indigo-500 text-white font-bold"
                      : isPassed
                      ? "bg-slate-900 border-slate-800 text-slate-400"
                      : "bg-slate-950/40 border-slate-900 text-slate-600"
                  }`}
                >
                  <div className="text-[9px] uppercase font-bold flex items-center justify-center gap-1">
                    <span>{turnNum}</span>
                    {isPassed ? <Check className="size-2.5 text-emerald-400" /> : !isCurrent ? <Lock className="size-2.5 opacity-50" /> : null}
                  </div>
                  <div className="text-[10px] truncate">{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER METRICS ONLY */}
      <footer className="h-14 border-t border-slate-800 bg-[#090e15] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-xl">❤️</div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Lives Saved</div>
            <div className="text-sm font-black text-white font-mono">{stats.lives.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">vs projected baseline</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="size-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">👑</span>
          <span>
            {stats.justice > 65
              ? "Spatial justice is prioritized. Low-income sectors receive equitable shade and cooling."
              : "Social equity is strained. Vulnerable communities bear the disproportionate heat burden."}
          </span>
        </div>
      </footer>
    </div>
  );
}
