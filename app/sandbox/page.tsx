'use client';

import React, { useState } from 'react';

export default function SandboxPage() {
    const [budget, setBudget] = useState(100);
    const [justiceIndex, setJusticeIndex] = useState(50);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('molenbeek');
    const [neighborhoods, setNeighborhoods] = useState({
        molenbeek: { name: "Molenbeek", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
        ixelles: { name: "Ixelles", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 }
    });
    const [alerts, setAlerts] = useState<string[]>([
        "System operational. Select a district and deploy urban policies, Mayor."
    ]);

    const n = neighborhoods[selectedNeighborhood as keyof typeof neighborhoods];

    const triggerAlert = (msg: string) => {
        setAlerts(prev => [msg, ...prev]);
    };

    const applyPolicy = (policyType: string) => {
        let currentBudget = budget;
        let currentJustice = justiceIndex;
        let updatedNeighborhoods = { ...neighborhoods };
        let targetN = { ...updatedNeighborhoods[selectedNeighborhood as keyof typeof updatedNeighborhoods] };
        let alertMessage = "";

        if (policyType === "greenCanopy") {
            if (currentBudget < 30) {
                triggerAlert("❌ Error: Insufficient municipal budget!");
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
                currentJustice = Math.min(100, currentJustice + 10);
            }
        } 
        else if (policyType === "tenantProtection") {
            if (currentBudget < 20) {
                triggerAlert("❌ Error: Insufficient municipal budget!");
                return;
            }
            currentBudget -= 20;
            targetN.gentrificationRisk = Math.max(0, targetN.gentrificationRisk - 30);
            currentJustice = Math.min(100, currentJustice + 25);
            alertMessage = `🛡️ Tenant rent safeguards and social protections secured in ${targetN.name}.`;
        } 
        else if (policyType === "coolingHubs") {
            if (currentBudget < 15) {
                triggerAlert("❌ Error: Insufficient municipal budget!");
                return;
            }
            currentBudget -= 15;
            targetN.heatRisk = Math.max(0, targetN.heatRisk - 35);
            alertMessage = `❄️ Emergency cooling hubs deployed in ${targetN.name} for heatwave mitigation.`;
        }

        updatedNeighborhoods[selectedNeighborhood as keyof typeof updatedNeighborhoods] = targetN;
        setBudget(currentBudget);
        setJusticeIndex(currentJustice);
        setNeighborhoods(updatedNeighborhoods);
        if (alertMessage) triggerAlert(alertMessage);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl mt-8 border border-slate-800">
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
                        Balance environmental resilience with social equity. Avoid green gentrification.
                    </p>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-medium">Budget</div>
                        <div className="text-xl font-bold text-emerald-400">{budget} pts</div>
                    </div>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-medium">Justice Index</div>
                        <div className="text-xl font-bold text-indigo-400">{justiceIndex}%</div>
                    </div>
                </div>
            </div>

            {/* Neighborhood Selector */}
            <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Select Target District
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(neighborhoods).map(([id, data]) => (
                        <button
                            key={id}
                            onClick={() => setSelectedNeighborhood(id)}
                            className={`p-4 rounded-xl text-left transition-all border ${
                                selectedNeighborhood === id 
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
                    <div className="text-2xl font-black text-amber-400 mt-1">{n.heatRisk} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                </div>
                <div>
                    <div className="text-xs text-slate-400">Green Canopy</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{n.greenCover}%</div>
                </div>
                <div>
                    <div className="text-xs text-slate-400">Gentrification Risk</div>
                    <div className="text-2xl font-black text-rose-400 mt-1">{n.gentrificationRisk}%</div>
                </div>
            </div>

            {/* Policy Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button 
                    onClick={() => applyPolicy('greenCanopy')} 
                    className="p-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 text-left transition-all group"
                >
                    <div className="text-emerald-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">🌿 Expand Canopy</div>
                    <p className="text-xs text-slate-400 mb-3">Lowers urban heat islands via massive green infrastructure.</p>
                    <span className="text-xs font-semibold bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md">Cost: 30 pts</span>
                </button>

                <button 
                    onClick={() => applyPolicy('tenantProtection')} 
                    className="p-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/60 text-left transition-all group"
                >
                    <div className="text-indigo-400 font-bold mb-1 group-hover:translate-x-1 transition-transform">🛡️ Rent Safeguards</div>
                    <p className="text-xs text-slate-400 mb-3">Implements anti-displacement and housing price caps.</p>
                    <span className="text-xs font-semibold bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-md">Cost: 20 pts</span>
                </button>

                <button 
                    onClick={() => applyPolicy('coolingHubs')} 
                    className="p-4 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 text-left transition-all group"
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
                    {alerts.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`p-3 rounded-lg border ${
                                msg.includes('⚠️') 
                                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-200' 
                                    : msg.includes('❌') 
                                    ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                        >
                            {msg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
