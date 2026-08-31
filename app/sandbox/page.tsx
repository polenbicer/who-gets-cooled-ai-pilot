'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, RefreshCw } from 'lucide-react';

export default function SandboxPage() {
  const [budget, setBudget] = useState(100);
  const [justiceIndex, setJusticeIndex] = useState(50);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('molenbeek');
  
  const [neighborhoods, setNeighborhoods] = useState({
    molenbeek: { name: "Molenbeek (Working Class)", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
    marolles: { name: "Marolles (Historic Core)", heatRisk: 90, greenCover: 15, vulnerability: 85, gentrificationRisk: 30 },
    ixelles: { name: "Ixelles (Mixed Urban)", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 },
    chatelain: { name: "Châtelain (Affluent)", heatRisk: 40, greenCover: 60, vulnerability: 15, gentrificationRisk: 85 }
  });

  const [alerts, setAlerts] = useState<string[]>([
    "System operational, Mayor. Balance your budget and raise the Justice Index without triggering displacement!"
  ]);

  const activeN = neighborhoods[selectedNeighborhood as keyof typeof neighborhoods];

  const triggerAlert = (msg: string) => {
    setAlerts(prev => [msg, ...prev]);
  };

  const applyPolicy = (policyType: string) => {
    if (gameStatus !== 'playing') return;

    let currentBudget = budget;
    let currentJustice = justiceIndex;
    let updatedNeighborhoods = { ...neighborhoods };
    let targetN = { ...updatedNeighborhoods[selectedNeighborhood as keyof typeof updatedNeighborhoods] };
    let alertMessage = "";

    const policyCosts: Record<string, number> = {
      greenCanopy: 30,
      tenantProtection: 20,
      coolingHubs: 15
    };
    const requiredCost = policyCosts[policyType] || 0;

    // Bütçe yetersizse doğrudan iflas / oyun bitti
    if (currentBudget < requiredCost) {
      setGameStatus('lost');
      triggerAlert(`💀 Bankrupt! Insufficient budget (${currentBudget} pts) for this policy (Requires ${requiredCost} pts). Municipality collapsed!`);
      return;
    }

    currentBudget -= requiredCost;

    if (policyType === "greenCanopy") {
      targetN.greenCover = Math.min(100, targetN.greenCover + 25);
      targetN.heatRisk = Math.max(0, targetN.heatRisk - 20);

      if (targetN.vulnerability > 70) {
        targetN.gentrificationRisk = Math.min(100, targetN.gentrificationRisk + 35);
        alertMessage = `⚠️ Green Gentrification in ${targetN.name}! Property values spiked and vulnerable residents face displacement.`;
        currentJustice = Math.max(0, currentJustice - 10);
      } else {
        alertMessage = `🌿 Green canopy expanded in ${targetN.name}. Heat stress reduced.`;
        currentJustice = Math.min(100, currentJustice + 12);
      }
    } 
    else if (policyType === "tenantProtection") {
      targetN.gentrificationRisk = Math.max(0, targetN.gentrificationRisk - 30);
      currentJustice = Math.min(100, currentJustice + 20);
      alertMessage = `🛡️ Tenant rent safeguards and anti-displacement protections secured in ${targetN.name}.`;
    } 
    else if (policyType === "coolingHubs") {
      targetN.heatRisk = Math.max(0, targetN.heatRisk - 35);
      currentJustice = Math.min(100, currentJustice + 8);
      alertMessage = `❄️ Emergency cooling hubs deployed in ${targetN.name} for immediate heatwave relief.`;
    }

    updatedNeighborhoods[selectedNeighborhood as keyof typeof updatedNeighborhoods] = targetN;
    setBudget(currentBudget);
    setJusticeIndex(currentJustice);
    setNeighborhoods(updatedNeighborhoods);
    if (alertMessage) triggerAlert(alertMessage);

    // Bütçe sıfırlanırsa veya adalet %80'in üzerine çıkıp başarı yakalanırsa durum güncellenir
    if (currentBudget <= 0) {
      setGameStatus('lost');
      triggerAlert("💀 Game Over! Treasury depleted.");
    } else if (currentJustice >= 80) {
      setGameStatus('won');
      triggerAlert("🎉 Victory! Exemplary sustainable and socially just urban governance achieved.");
    }
  };

  const resetGame = () => {
    setBudget(100);
    setJusticeIndex(50);
    setGameStatus('playing');
    setNeighborhoods({
      molenbeek: { name: "Molenbeek (Working Class)", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
      marolles: { name: "Marolles (Historic Core)", heatRisk: 90, greenCover: 15, vulnerability: 85, gentrificationRisk: 30 },
      ixelles: { name: "Ixelles (Mixed Urban)", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 },
      chatelain: { name: "Châtelain (Affluent)", heatRisk: 40, greenCover: 60, vulnerability: 15, gentrificationRisk: 85 }
    });
    setAlerts(["System reset. New mayoral term started."]);
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans p-6 md:p-10">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-slate-950 transition-colors bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-xs"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-mono text-stone-500">Brussels Urban Governance Simulation</span>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 relative">
        
        {/* Game Over / Win Overlay Modal */}
        {gameStatus !== 'playing' && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 rounded-2xl text-center backdrop-blur-md">
            {gameStatus === 'won' ? (
              <>
                <div className="text-5xl mb-4">👑🏆</div>
                <h2 className="text-3xl font-black text-emerald-400 mb-2">Victory, Mayor!</h2>
                <p className="text-slate-300 max-w-md mb-6 text-sm">
                  You successfully optimized the Justice Index to 80%+ while preserving municipal resources!
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">💀📉</div>
                <h2 className="text-3xl font-black text-rose-500 mb-2">Bankrupt / Game Over</h2>
                <p className="text-slate-300 max-w-md mb-6 text-sm">
                  Your municipal budget was depleted or insufficient to fund further policies. Administration collapsed!
                </p>
              </>
            )}
            <button 
              onClick={resetGame}
              className="px-6 py-3 bg-[#c2410c] hover:bg-[#a9370a] font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#c2410c] font-semibold bg-orange-950/40 px-3 py-1 rounded-full border border-orange-900/40">
              Interactive Policy Sandbox
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
              Brussels Climate &amp; Justice Simulator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage budget wisely. Avoid bankruptcy and mitigate green gentrification.
            </p>
          </div>
          <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 flex items-center gap-4 shadow-inner">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Budget</div>
              <div className="text-xl font-bold text-emerald-400">{budget} pts</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-medium">Justice Index</div>
              <div className="text-xl font-bold text-indigo-400">{justiceIndex}%</div>
            </div>
          </div>
        </div>

        {/* Neighborhood Selector (4 Seçenek) */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Select Target District (4 Options)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(neighborhoods).map(([id, data]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedNeighborhood(id)}
                className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                  selectedNeighborhood === id 
                    ? 'bg-orange-950/30 border-[#c2410c] text-white shadow-lg' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold text-sm">{data.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex gap-4">
                  <span>Heat Risk: <strong className="text-amber-400">{data.heatRisk}</strong></span>
                  <span>Gentrification: <strong className="text-rose-400">{data.gentrificationRisk}%</strong></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* District Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Heat Stress Risk</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{activeN.heatRisk} <span className="text-xs font-normal text-slate-500">/ 100</span></div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Green Canopy</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{activeN.greenCover}%</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Gentrification Risk</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{activeN.gentrificationRisk}%</div>
          </div>
        </div>

        {/* Policy Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            type="button"
            onClick={() => applyPolicy('greenCanopy')} 
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
          >
            <div className="text-emerald-400 font-bold mb-1 group-hover:translate-x-1 transition-transform text-xs">🌿 Expand Canopy</div>
            <p className="text-[11px] text-slate-400 mb-3">Lowers urban heat islands via massive green infrastructure.</p>
            <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-900/50">Cost: 30 pts</span>
          </button>

          <button 
            type="button"
            onClick={() => applyPolicy('tenantProtection')} 
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
          >
            <div className="text-indigo-400 font-bold mb-1 group-hover:translate-x-1 transition-transform text-xs">🛡️ Rent Safeguards</div>
            <p className="text-[11px] text-slate-400 mb-3">Implements anti-displacement and housing price caps.</p>
            <span className="text-[10px] font-semibold bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-900/50">Cost: 20 pts</span>
          </button>

          <button 
            type="button"
            onClick={() => applyPolicy('coolingHubs')} 
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-all group cursor-pointer"
          >
            <div className="text-sky-400 font-bold mb-1 group-hover:translate-x-1 transition-transform text-xs">❄️ Cooling Hubs</div>
            <p className="text-[11px] text-slate-400 mb-3">Rapid pop-up emergency relief centers during heatwaves.</p>
            <span className="text-[10px] font-semibold bg-sky-950 text-sky-300 px-2.5 py-1 rounded-md border border-sky-900/50">Cost: 15 pts</span>
          </button>
        </div>

        {/* Console / Alert Feed */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Policy Impact &amp; System Feed
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
            {alerts.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  msg.includes('⚠️') 
                    ? 'bg-amber-950/40 border-amber-800/50 text-amber-200' 
                    : msg.includes('❌') || msg.includes('💀')
                    ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                    : msg.includes('🎉')
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                    : 'bg-slate-950 border-slate-800/80 text-slate-300'
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
