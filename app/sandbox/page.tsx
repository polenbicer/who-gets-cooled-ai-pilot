"use client";

import { useMemo, useState } from "react";

type District = { name: string; score: number; x: number; y: number; size: number };
type Choice = { title: string; icon: string; body: string; effects: string; cost: number };

const districts: District[] = [
  { name: "Bağcılar", score: 96, x: 31, y: 34, size: 86 },
  { name: "Esenler", score: 91, x: 50, y: 29, size: 74 },
  { name: "Fatih", score: 93, x: 68, y: 37, size: 82 },
  { name: "Kadıköy", score: 74, x: 74, y: 72, size: 66 },
  { name: "Üsküdar", score: 67, x: 79, y: 56, size: 60 },
  { name: "Northern Belt", score: 39, x: 65, y: 15, size: 58 },
];

const choices: Choice[] = [
  { title: "Audit the AI system", icon: "⚖", body: "Launch an independent audit and publish the results. Restore confidence before the next heatwave.", effects: "Justice +15 · Trust +10", cost: 12 },
  { title: "Increase dataset diversity", icon: "◉", body: "Invest in better local data collection and community input so low-income heat islands stop being invisible.", effects: "Justice +10 · Approval +8", cost: 18 },
  { title: "Trust the system", icon: "♙", body: "AI is generally right. No changes are needed at this time. Keep the budget intact.", effects: "Budget +8 · Trust −10 · Justice −8", cost: 0 },
  { title: "Blame the vendors", icon: "📣", body: "Hold a press conference and put responsibility on the technology provider.", effects: "Approval +5 · Trust −5", cost: 4 },
  { title: "Community panel", icon: "👥", body: "Create a citizen panel to review AI recommendations together with city officials.", effects: "Approval +10 · Trust +8 · Budget −6", cost: 6 },
];

function tone(score: number) {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function Metric({ icon, label, value, unit = "/100" }: { icon: string; label: string; value: string | number; unit?: string }) {
  return <div className="metric"><span className="metricIcon">{icon}</span><div><span className="metricLabel">{label}</span><strong>{value}<small>{unit}</small></strong></div></div>;
}

function MapArt({ selected, onSelect }: { selected: District; onSelect: (d: District) => void }) {
  return (
    <div className="mapArt">
      <div className="mapTexture" />
      <svg className="mapSvg" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-label="Istanbul district heat map">
        <path className="water" d="M500 0 C450 100 530 165 465 235 C390 320 455 360 410 430 C365 505 455 580 520 700 L720 700 C650 590 680 520 610 445 C550 380 640 325 585 250 C530 180 600 95 570 0 Z" />
        <path className="shore" d="M0 365 C160 325 240 340 360 300 C440 270 455 210 520 180 C590 150 650 170 735 115 C820 60 900 50 1000 20" />
        <path className="road r1" d="M0 505 C170 450 270 475 410 420 S710 380 1000 450" />
        <path className="road r2" d="M120 0 C220 100 250 190 340 250 S470 350 520 500 S560 650 620 700" />
        <path className="road r3" d="M300 0 C355 90 410 150 470 200 S600 280 760 330 S900 430 1000 520" />
        <path className="road r4" d="M0 200 C150 230 250 200 390 220 S650 300 800 250 S930 180 1000 190" />
        <path className="road r5" d="M30 620 C210 540 290 550 390 530 S600 500 820 590 S920 650 1000 620" />
      </svg>
      <div className="riskLegend"><b>RISK LEVEL</b><span><i className="dot low"/>Low</span><span><i className="dot medium"/>Medium</span><span><i className="dot high"/>High</span><span><i className="dot critical"/>Very High</span></div>
      <button className="mapControl target" aria-label="Center map">⌾</button>
      <button className="mapControl layers" aria-label="Map layers">▱</button>
      <div className="zoom"><button>+</button><button>−</button></div>
      {districts.map(d => {
        const selectedClass = selected.name === d.name ? " selected" : "";
        return <button key={d.name} className={`pin ${tone(d.score)}${selectedClass}`} style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }} onClick={() => onSelect(d)} aria-label={`Select ${d.name}`}>
          <span>{d.score}</span><em>{d.name}</em>
        </button>;
      })}
      <div className="mapInfo"><strong>{selected.name}</strong><span>{tone(selected.score) === "critical" ? "Very High" : tone(selected.score)} Risk</span><div className="infoGrid"><b>🌡 {selected.score}</b><b>🏠 {Math.max(48, selected.score - 5)}</b><b>♟ {Math.max(18, 100-selected.score)}</b><b>🌳 {Math.max(12, 100-selected.score)}</b><b>👥 {selected.score > 85 ? "742K" : "531K"}</b></div></div>
    </div>
  );
}

export default function SandboxMayorGame() {
  const [selected, setSelected] = useState(districts[0]);
  const [budget, setBudget] = useState(62);
  const [heat, setHeat] = useState(72);
  const [justice, setJustice] = useState(54);
  const [approval, setApproval] = useState(58);
  const [trust, setTrust] = useState(63);
  const [council, setCouncil] = useState(46);
  const [chosen, setChosen] = useState<number | null>(null);
  const [turn, setTurn] = useState(4);

  const stakeholder = useMemo(() => ({ citizens: Math.round((approval + trust) / 2), activists: justice, developers: Math.min(90, budget + 2), media: Math.max(25, approval - 11), council }), [approval, trust, justice, budget, council]);

  function choose(i: number) {
    if (chosen !== null) return;
    const c = choices[i];
    if (c.cost > budget) return;
    setChosen(i); setBudget(b => Math.max(0, b - c.cost));
    if (i === 0) { setJustice(v => Math.min(100, v + 15)); setTrust(v => Math.min(100, v + 10)); }
    if (i === 1) { setJustice(v => Math.min(100, v + 10)); setApproval(v => Math.min(100, v + 8)); }
    if (i === 2) { setBudget(v => v + 8); setTrust(v => Math.max(0, v - 10)); setJustice(v => Math.max(0, v - 8)); }
    if (i === 3) { setApproval(v => Math.min(100, v + 5)); setTrust(v => Math.max(0, v - 5)); }
    if (i === 4) { setApproval(v => Math.min(100, v + 10)); setTrust(v => Math.min(100, v + 8)); setCouncil(v => Math.max(0, v - 6)); }
  }

  function nextTurn() {
    setTurn(t => Math.min(12, t + 1)); setChosen(null); setHeat(v => Math.max(0, v - 2)); setBudget(v => Math.max(0, v - 3));
  }

  return <main className="game">
    <style>{css}</style>
    <header className="topbar">
      <div className="turn"><b>TURN {turn} / 12</b><span>Algorithm Blind Spot</span></div>
      <Metric icon="🪙" label="BUDGET" value={budget} unit="M €" />
      <Metric icon="🌡" label="HEAT" value={heat} />
      <Metric icon="⚖" label="JUSTICE" value={justice} />
      <Metric icon="👥" label="APPROVAL" value={approval} />
      <Metric icon="🤝" label="TRUST" value={trust} />
      <Metric icon="🏛" label="COUNCIL" value={council} />
      <button className="advisor">🤖 AI ADVISOR</button><button className="settings">⚙</button>
    </header>

    <section className="workspace">
      <aside className="leftRail">
        <div className="cityCard"><div className="cityPhoto"/><b>ISTANBUL 🇹🇷</b><span>Extreme density / northern green belt</span><button>⌄</button></div>
        <div className="panel riskPanel"><h3>DISTRICT RISK OVERVIEW</h3>{districts.map(d => <button className="riskRow" key={d.name} onClick={() => setSelected(d)}><i className={`score ${tone(d.score)}`}>{d.score}</i><span>{d.name}</span><em>{tone(d.score) === "critical" ? "Very High" : tone(d.score)}</em></button>)}</div>
        <div className="panel aiPanel"><div className="brain">♧</div><h3>AI PRIORITY SUGGESTION</h3><p>Your AI models predict the highest risk of heat-related health complaints in <b>Bağcılar</b>. Would you like to prioritize it?</p><button onClick={() => setSelected(districts[0])}>Analyze Bağcılar</button></div>
        <div className="panel moodPanel"><h3>STAKEHOLDER MOOD</h3>{Object.entries(stakeholder).map(([k,v]) => <div className="mood" key={k}><span>{k === "citizens" ? "👥" : k === "activists" ? "🌱" : k === "developers" ? "🏢" : k === "media" ? "📺" : "🏛"} {k}</span><i><b style={{ width: `${v}%` }}/></i><strong>{v}</strong></div>)}</div>
      </aside>

      <section className="mapColumn"><MapArt selected={selected} onSelect={setSelected}/><div className="selectedDistrict"><div><small>SELECTED DISTRICT</small><h2>{selected.name}</h2><p>AI priority score: <b>{Math.max(0, selected.score - 65)} / 100</b></p></div><button>CLICK A MAP PIN</button></div></section>

      <aside className="eventPanel">
        <div className="eventHead"><span>♨ CURRENT EVENT</span><h1>ALGORITHM BLIND SPOT</h1><p>Your AI system failed to detect a rapidly heating microclimate in low-income areas. The public is asking tough questions.</p></div>
        <h3 className="chooseLabel">Choose your response:</h3>
        <div className="choices">{choices.map((c,i) => <button key={c.title} className={`choice ${chosen === i ? "chosen" : ""} ${chosen !== null && chosen !== i ? "muted" : ""}`} onClick={() => choose(i)}><div className="choiceIcon">{c.icon}</div><div className="choiceCopy"><strong>{c.title}</strong><p>{c.body}</p><span>{c.effects}</span></div><b className="cost">Cost: {c.cost}M €</b></button>)}</div>
        <button className="history">↗ View Decision History</button>
      </aside>
    </section>

    <section className="timeline"><div className="timelineTitle">GAME TIMELINE</div>{["Heatwave","Elderly Crisis","Developer Pressure","Algorithm Blind Spot","Protest Erupts","Housing Crisis","Power Grid Failure","Media Scandal","Budget Crisis","City Council Showdown","Public Health Emergency","Election Campaign"].map((x,i) => <div key={x} className={`step ${i === turn-1 ? "active" : i < turn-1 ? "done" : "locked"}`}><b>{i+1}</b><span>{x}</span></div>)}</section>

    <footer className="footer"><div className="life"><small>♥ LIVES SAVED</small><strong>1,248</strong><span>vs. projected baseline</span></div><div className="legacy"><span>♛</span><div><small>YOUR LEGACY SO FAR</small><p>You're trying to balance climate action with political survival. Some groups support you, others are watching closely.</p></div></div><div className="next"><div><small>NEXT TURN PREVIEW</small><p>Protests are brewing after a controversial housing demolition.</p></div><button onClick={nextTurn}>Prepare for Next Turn <b>→</b></button></div></footer>
  </main>;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{--bg:#071018;--panel:#0d1720;--panel2:#111d27;--line:#273640;--text:#f4f7f9;--muted:#9ba9b2;--cyan:#5ce1e6;--purple:#8b72ff;--green:#55d27b;--orange:#f6a316;--red:#ef3b35}*{box-sizing:border-box}body{margin:0;background:#061018;color:var(--text);font-family:'DM Sans',sans-serif}.game{min-height:100vh;background:radial-gradient(circle at 50% 20%,#13232d 0,#071018 42%,#04090d 100%);overflow:hidden}.topbar{height:72px;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid #27333c;background:#08121a;position:sticky;top:0;z-index:20}.turn{width:205px;border-right:1px solid #26343d;display:flex;flex-direction:column;gap:3px}.turn b{font:700 16px 'Space Grotesk';letter-spacing:.04em}.turn span{font-size:12px;color:#aebbc2}.metric{min-width:108px;height:52px;display:flex;align-items:center;gap:8px;padding:0 8px}.metricIcon{font-size:21px}.metricLabel{display:block;color:#9ba7af;font-size:10px;font-weight:700;letter-spacing:.08em}.metric strong{font:700 18px 'Space Grotesk';color:#f7bf42}.metric:nth-child(4) strong{color:#ff6565}.metric:nth-child(5) strong{color:#a98bff}.metric:nth-child(6) strong{color:#58a0ff}.metric:nth-child(7) strong{color:#5de1b0}.metric:nth-child(8) strong{color:#f6a316}.metric small{font:500 11px 'DM Sans';color:#91a0a9;margin-left:2px}.advisor{margin-left:auto;border:1px solid #4b45d5;background:#15194b;color:#e9e8ff;border-radius:8px;padding:11px 16px;font-weight:700;letter-spacing:.04em}.settings{border:1px solid #273640;background:#0d1720;color:#d9e2e7;border-radius:50%;width:40px;height:40px;margin-left:6px}.workspace{display:grid;grid-template-columns:250px minmax(520px,1fr) 390px;gap:12px;padding:12px 16px 10px;max-width:1700px;margin:auto}.leftRail{display:flex;flex-direction:column;gap:10px}.cityCard,.panel,.eventPanel,.selectedDistrict{border:1px solid var(--line);background:linear-gradient(180deg,#101b24,#0b151d);border-radius:12px;box-shadow:0 16px 45px rgba(0,0,0,.2)}.cityCard{padding:10px;position:relative;overflow:hidden}.cityPhoto{height:88px;border-radius:8px;margin-bottom:9px;background:linear-gradient(135deg,rgba(3,15,20,.2),rgba(3,10,15,.85)),url('https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=70') center/cover}.cityCard>b{font:700 14px 'Space Grotesk';display:block}.cityCard span{font-size:11px;color:#a8b4bb;display:block;margin-top:4px}.cityCard button{position:absolute;right:14px;bottom:13px;background:none;border:0;color:white;font-size:18px}.panel{padding:13px}.panel h3{font-size:10px;letter-spacing:.08em;color:#8e9aa1;margin:0 0 10px}.riskRow{width:100%;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:7px;background:none;border:0;color:#f2f4f5;text-align:left;padding:6px 0;cursor:pointer}.riskRow span{font-size:12px;font-weight:600}.riskRow em{font-size:10px;font-style:normal;color:#f04a44}.score{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:10px;font-weight:800;color:#fff}.score.critical{background:#e72f2f}.score.high{background:#f3a10f}.score.medium{background:#e2b11d}.score.low{background:#168d75}.aiPanel{position:relative;background:linear-gradient(145deg,#0d1926,#101632)}.aiPanel .brain{position:absolute;right:14px;top:13px;color:#756bff;font-size:23px}.aiPanel h3{color:#6b8fff}.aiPanel p{font-size:11px;line-height:1.45;color:#b8c2c8}.aiPanel button{width:100%;border:0;background:linear-gradient(90deg,#6656e8,#3b5ce0);color:white;border-radius:6px;padding:8px;font-weight:700;font-size:11px;cursor:pointer}.mood{display:grid;grid-template-columns:94px 1fr 22px;align-items:center;gap:5px;margin:8px 0;font-size:10px;color:#cbd3d7}.mood i{height:5px;background:#26343b;border-radius:9px;overflow:hidden}.mood i b{height:100%;display:block;background:#62b874;border-radius:9px}.mood strong{font-size:10px;text-align:right}.mapColumn{min-width:0}.mapArt{height:620px;border:1px solid #26343d;border-radius:15px;overflow:hidden;position:relative;background:#102f36;box-shadow:0 20px 50px rgba(0,0,0,.28)}.mapTexture{position:absolute;inset:0;background:radial-gradient(circle at 22% 62%,rgba(97,128,97,.55) 0 1px,transparent 2px),radial-gradient(circle at 75% 24%,rgba(87,118,83,.7) 0 1px,transparent 2px),linear-gradient(135deg,#29483b,#60796c 48%,#183d49);background-size:15px 15px,13px 13px,100% 100%;filter:saturate(.85)}.mapTexture:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(28deg,transparent 0 42px,rgba(255,255,255,.035) 43px 45px),repeating-linear-gradient(-24deg,transparent 0 67px,rgba(0,0,0,.06) 68px 70px);mix-blend-mode:overlay}.mapSvg{position:absolute;inset:0;width:100%;height:100%;opacity:.75}.water{fill:#0d5263;filter:drop-shadow(0 0 10px rgba(0,0,0,.5))}.shore{fill:none;stroke:#d7ddcc;stroke-width:4;opacity:.75}.road{fill:none;stroke:#e2d9bd;stroke-width:3;opacity:.32}.riskLegend{position:absolute;top:18px;left:18px;display:flex;gap:15px;align-items:center;background:rgba(5,10,12,.82);border:1px solid #31404a;padding:10px 13px;border-radius:7px;font-size:10px}.riskLegend b{font-size:10px}.riskLegend span{display:flex;gap:5px;align-items:center;color:#d4dcdf}.dot{width:10px;height:10px;border-radius:50%;display:inline-block}.dot.low{background:#49a33e}.dot.medium{background:#ffbd21}.dot.high{background:#f47e0b}.dot.critical{background:#e82f2c}.mapControl{position:absolute;right:16px;width:42px;height:42px;border-radius:8px;border:1px solid #40515a;background:#07131a;color:#fff;font-size:21px}.target{top:18px}.layers{top:68px}.zoom{position:absolute;right:16px;top:120px;display:flex;flex-direction:column}.zoom button{width:42px;height:42px;border:1px solid #40515a;background:#07131a;color:#fff;font-size:22px}.zoom button:first-child{border-radius:8px 8px 0 0}.zoom button:last-child{border-radius:0 0 8px 8px;border-top:0}.pin{position:absolute;transform:translate(-50%,-50%);border:4px solid rgba(255,255,255,.94);border-radius:50%;color:white;display:grid;place-items:center;font-weight:800;font-size:15px;box-shadow:0 10px 22px rgba(0,0,0,.35);cursor:pointer;transition:.2s;z-index:4}.pin:hover,.pin.selected{transform:translate(-50%,-50%) scale(1.09);box-shadow:0 0 0 4px rgba(255,255,255,.15),0 14px 28px rgba(0,0,0,.45)}.pin.critical{background:#ed2425}.pin.high{background:#f6a10d}.pin.medium{background:#dda51a}.pin.low{background:#118a7f}.pin em{position:absolute;top:-25px;white-space:nowrap;font-style:normal;font-size:11px;text-shadow:0 2px 4px #000}.mapInfo{position:absolute;left:235px;bottom:30px;width:240px;background:rgba(4,10,12,.9);border:1px solid #34434b;border-radius:8px;padding:12px;z-index:6}.mapInfo strong{font:700 16px 'Space Grotesk';display:block}.mapInfo>span{font-size:11px;color:#ef554d}.infoGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px;font-size:10px;color:#bdc8cc}.selectedDistrict{margin-top:10px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}.selectedDistrict small{color:#d76d4a;font-weight:800;font-size:10px;letter-spacing:.09em}.selectedDistrict h2{font:700 27px 'Space Grotesk';margin:5px 0}.selectedDistrict p{margin:0;color:#89979f;font-size:12px}.selectedDistrict button{background:#1a2329;color:#8f999f;border:0;border-radius:22px;padding:14px 18px;font-weight:800}.eventPanel{padding:18px;height:fit-content;min-height:620px;border-color:#d66e2c;background:linear-gradient(180deg,#0e1820,#091219)}.eventHead>span{font-size:11px;font-weight:800;color:#ef7d43;letter-spacing:.1em}.eventHead h1{font:700 25px 'Space Grotesk';margin:16px 0 10px}.eventHead p{font-size:12px;line-height:1.55;color:#bdc7cb;margin-bottom:20px}.chooseLabel{font-size:11px;color:#d7dfe2;margin:0 0 9px}.choices{display:flex;flex-direction:column;gap:8px}.choice{position:relative;text-align:left;display:grid;grid-template-columns:32px 1fr auto;gap:9px;padding:12px 10px;border-radius:10px;border:1px solid #2d3941;background:linear-gradient(135deg,#1a242c,#121b22);color:white;cursor:pointer;transition:.18s}.choice:hover,.choice.chosen{border-color:#746cff;box-shadow:0 0 0 1px #746cff inset;background:#222632}.choice.muted{opacity:.48}.choiceIcon{font-size:20px;padding-top:2px}.choiceCopy strong{font-size:13px}.choiceCopy p{font-size:10px;line-height:1.4;color:#aeb9bf;margin:5px 0}.choiceCopy span{font-size:10px;color:#65d9e2}.cost{font-size:9px;align-self:end;color:#7ff0ba;border:1px solid #24865e;border-radius:6px;padding:5px 7px;white-space:nowrap}.history{display:block;margin:13px auto 0;background:none;border:0;color:#d2d9dc;font-size:10px}.timeline{height:68px;margin:0 16px 10px;border:1px solid #29363e;background:#eef0ee;color:#1a2429;border-radius:10px;display:grid;grid-template-columns:120px repeat(12,1fr);overflow:hidden}.timelineTitle{padding:12px 15px;font-size:9px;font-weight:800;color:#7b8588}.step{position:relative;padding:11px 6px 5px;border-left:1px solid #d5dad8;display:flex;flex-direction:column;gap:4px;justify-content:center;font-size:8px}.step b{font-size:9px;color:#667176}.step.done{background:#e4e8e5}.step.active{background:#d9d7ff;color:#28255b}.step.locked{color:#899195}.footer{display:grid;grid-template-columns:260px 1fr 1.2fr;gap:10px;padding:0 16px 16px}.life,.legacy,.next{min-height:72px;border:1px solid #27353e;border-radius:10px;background:#0b151d;padding:12px 15px;display:flex;align-items:center}.life{flex-direction:column;align-items:flex-start;justify-content:center}.life small,.legacy small,.next small{font-size:9px;color:#839098;font-weight:800;letter-spacing:.06em}.life strong{font:700 19px 'Space Grotesk';color:#fff}.life span{font-size:9px;color:#77848b}.legacy{gap:14px}.legacy>span{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#c99420;color:#fff;font-size:20px}.legacy p,.next p{margin:5px 0 0;font-size:10px;color:#aeb9be;line-height:1.35}.next{justify-content:space-between}.next button{border:0;border-radius:7px;background:linear-gradient(90deg,#5042c9,#314ed8);color:white;padding:12px 14px;font-weight:800;white-space:nowrap}.next button b{margin-left:15px;font-size:16px}@media(max-width:1200px){.workspace{grid-template-columns:220px 1fr}.eventPanel{grid-column:1/-1}.metric{min-width:90px}.timeline{grid-template-columns:80px repeat(12,1fr)}.footer{grid-template-columns:1fr 1fr}.next{grid-column:1/-1}}@media(max-width:800px){.topbar{overflow:auto}.workspace{grid-template-columns:1fr}.leftRail{order:2}.mapColumn{order:1}.eventPanel{order:3}.mapArt{height:500px}.timeline{overflow:auto;grid-template-columns:90px repeat(12,100px)}.footer{grid-template-columns:1fr}.mapInfo{left:20px}.pin em{display:none}}
`;
