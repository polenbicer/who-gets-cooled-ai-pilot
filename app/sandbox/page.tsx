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
    const [alerts, setAlerts] = useState<string[]>(["Sistem hazır. Bir mahalle seç ve politika uygula, Sayın Başkan."]);

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
                triggerAlert("❌ Hata: Yetersiz bütçe!");
                return;
            }
            currentBudget -= 30;
            targetN.greenCover = Math.min(100, targetN.greenCover + 25);
            targetN.heatRisk = Math.max(0, targetN.heatRisk - 20);

            if (targetN.vulnerability > 70) {
                targetN.gentrificationRisk = Math.min(100, targetN.gentrificationRisk + 40);
                alertMessage = `⚠️ ${targetN.name} bölgesinde Yeşil Soyulaştırma Uyarısı! Arsa değerleri fırladı; dezavantajlı halk yerinden ediliyor.`;
                currentJustice = Math.max(0, currentJustice - 15);
            } else {
                alertMessage = `🌿 ${targetN.name} bölgesinde yeşil alanlar genişletildi.`;
                currentJustice = Math.min(100, currentJustice + 10);
            }
        } 
        else if (policyType === "tenantProtection") {
            if (currentBudget < 20) {
                triggerAlert("❌ Hata: Yetersiz bütçe!");
                return;
            }
            currentBudget -= 20;
            targetN.gentrificationRisk = Math.max(0, targetN.gentrificationRisk - 30);
            currentJustice = Math.min(100, currentJustice + 25);
            alertMessage = `🛡️ ${targetN.name} bölgesinde kira koruma ve sosyal güvenceler sağlandı.`;
        } 
        else if (policyType === "coolingHubs") {
            if (currentBudget < 15) {
                triggerAlert("❌ Hata: Yetersiz bütçe!");
                return;
            }
            currentBudget -= 15;
            targetN.heatRisk = Math.max(0, targetN.heatRisk - 35);
            alertMessage = `❄️ ${targetN.name} bölgesinde acil serinleme merkezleri kuruldu.`;
        }

        updatedNeighborhoods[selectedNeighborhood as keyof typeof updatedNeighborhoods] = targetN;
        setBudget(currentBudget);
        setJusticeIndex(currentJustice);
        setNeighborhoods(updatedNeighborhoods);
        if (alertMessage) triggerAlert(alertMessage);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow max-w-2xl mx-auto mt-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4">Brussels Climate & Justice Sandbox</h2>
            
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => setSelectedNeighborhood('molenbeek')} 
                    className={`px-3 py-1 rounded ${selectedNeighborhood === 'molenbeek' ? 'bg-black text-white' : 'bg-gray-200'}`}
                >
                    Molenbeek
                </button>
                <button 
                    onClick={() => setSelectedNeighborhood('ixelles')} 
                    className={`px-3 py-1 rounded ${selectedNeighborhood === 'ixelles' ? 'bg-black text-white' : 'bg-gray-200'}`}
                >
                    Ixelles
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded text-sm">
                <div>Bütçe: <span className="font-bold">{budget}</span></div>
                <div>Adalet Endeksi: <span className="font-bold">{justiceIndex}</span></div>
                <div>Isı Riski: <span className="font-bold">{n.heatRisk}</span></div>
                <div>Yeşil Alan: <span className="font-bold">{n.greenCover}%</span></div>
                <div>Soylulaştırma: <span className="font-bold">{n.gentrificationRisk}%</span></div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <button onClick={() => applyPolicy('greenCanopy')} className="p-2 bg-emerald-600 text-white rounded text-left hover:bg-emerald-700">🌿 Yeşil Alanı Genişlet (-30 Bütçe)</button>
                <button onClick={() => applyPolicy('tenantProtection')} className="p-2 bg-indigo-600 text-white rounded text-left hover:bg-indigo-700">🛡️ Kira Koruması Getir (-20 Bütçe)</button>
                <button onClick={() => applyPolicy('coolingHubs')} className="p-2 bg-sky-600 text-white rounded text-left hover:bg-sky-700">❄️ Soğutma Merkezi Kur (-15 Bütçe)</button>
            </div>

            <div className="border p-4 rounded bg-amber-50 min-h-[100px] max-h-[200px] overflow-y-auto text-sm space-y-2">
                {alerts.map((msg, index) => (
                    <div key={index} className="p-2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                        {msg}
                    </div>
                ))}
            </div>
        </div>
    );
}
