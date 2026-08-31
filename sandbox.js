const gameState = {
    budget: 100,
    justiceIndex: 50,
    neighborhoods: {
        molenbeek: { name: "Molenbeek", heatRisk: 85, greenCover: 10, vulnerability: 90, gentrificationRisk: 20 },
        ixelles: { name: "Ixelles", heatRisk: 50, greenCover: 40, vulnerability: 30, gentrificationRisk: 60 }
    },
    selectedNeighborhood: "molenbeek"
};

function selectNeighborhood(id) {
    gameState.selectedNeighborhood = id;
    updateUI();
}

function applyPolicy(policyType) {
    const n = gameState.neighborhoods[gameState.selectedNeighborhood];
    let alertMessage = "";

    if (policyType === "greenCanopy") {
        if (gameState.budget < 30) return triggerAlert("❌ Hata: Yetersiz bütçe!");
        gameState.budget -= 30;
        n.greenCover = Math.min(100, n.greenCover + 25);
        n.heatRisk = Math.max(0, n.heatRisk - 20);

        if (n.vulnerability > 70) {
            n.gentrificationRisk = Math.min(100, n.gentrificationRisk + 40);
            alertMessage = `⚠️ ${n.name} bölgesinde Yeşil Soyulaştırma Uyarısı! Arsa değerleri fırladı; dezavantajlı halk yerinden ediliyor.`;
            gameState.justiceIndex = Math.max(0, gameState.justiceIndex - 15);
        } else {
            alertMessage = `🌿 ${n.name} bölgesinde yeşil alanlar genişletildi.`;
            gameState.justiceIndex = Math.min(100, gameState.justiceIndex + 10);
        }
    } 
    else if (policyType === "tenantProtection") {
        if (gameState.budget < 20) return triggerAlert("❌ Hata: Yetersiz bütçe!");
        gameState.budget -= 20;
        n.gentrificationRisk = Math.max(0, n.gentrificationRisk - 30);
        gameState.justiceIndex = Math.min(100, gameState.justiceIndex + 25);
        alertMessage = `🛡️ ${n.name} bölgesinde kira koruma ve sosyal güvenceler sağlandı.`;
    } 
    else if (policyType === "coolingHubs") {
        if (gameState.budget < 15) return triggerAlert("❌ Hata: Yetersiz bütçe!");
        gameState.budget -= 15;
        n.heatRisk = Math.max(0, n.heatRisk - 35);
        alertMessage = `❄️ ${n.name} bölgesinde acil serinleme merkezleri kuruldu.`;
    }

    updateUI();
    if (alertMessage) triggerAlert(alertMessage);
}

function updateUI() {
    const n = gameState.neighborhoods[gameState.selectedNeighborhood];
    if (document.getElementById("budget-val")) document.getElementById("budget-val").innerText = gameState.budget;
    if (document.getElementById("justice-val")) document.getElementById("justice-val").innerText = gameState.justiceIndex;
    if (document.getElementById("heat-val")) document.getElementById("heat-val").innerText = n.heatRisk;
    if (document.getElementById("green-val")) document.getElementById("green-val").innerText = n.greenCover + "%";
    if (document.getElementById("gent-val")) document.getElementById("gent-val").innerText = n.gentrificationRisk + "%";
}

function triggerAlert(msg) {
    const feed = document.getElementById("alert-feed");
    if (feed) {
        feed.innerHTML = `<div class="p-3 mb-2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-sm">${msg}</div>` + feed.innerHTML;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateUI();
});
