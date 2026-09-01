"use client";

import { useMemo, useState } from "react";

type CityKey = "Brussels" | "Amsterdam" | "Istanbul" | "Izmir";

type District = {
  name: string;
  score: number;
  x: number;
  y: number;
  description: string;
  heat: number;
  poverty: number;
  elderly: number;
  housing: number;
  green: number;
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

const cityData: Record<CityKey, {
  country: string;
  flag: string;
  subtitle: string;
  districts: District[];
  accent: string;
}> = {
  Brussels: {
    country: "Belgium",
    flag: "🇧🇪",
    subtitle: "Dense capital / ring-road heat pockets",
    accent: "#e86d2d",
    districts: [
      { name: "Molenbeek", score: 88, x: 31, y: 48, description: "Dense housing, limited tree canopy and high summer exposure.", heat: 91, poverty: 86, elderly: 34, housing: 89, green: 22 },
      { name: "Schaerbeek", score: 81, x: 48, y: 30, description: "Hot apartment corridors around busy transport arteries.", heat: 84, poverty: 76, elderly: 41, housing: 82, green: 31 },
      { name: "Saint-Gilles", score: 75, x: 50, y: 62, description: "Compact urban blocks with pressure on public cooling space.", heat: 79, poverty: 64, elderly: 39, housing: 77, green: 28 },
      { name: "Anderlecht", score: 84, x: 22, y: 69, description: "Industrial edges meet vulnerable residential streets.", heat: 88, poverty: 81, elderly: 37, housing: 85, green: 27 },
      { name: "Uccle", score: 42, x: 57, y: 82, description: "Leafier residential district with comparatively low heat burden.", heat: 48, poverty: 31, elderly: 46, housing: 54, green: 72 },
      { name: "Woluwe", score: 36, x: 76, y: 53, description: "High tree coverage and lower surface-temperature risk.", heat: 40, poverty: 27, elderly: 44, housing: 49, green: 81 },
    ],
  },
  Amsterdam: {
    country: "Netherlands",
    flag: "🇳🇱",
    subtitle: "Canal city / water-edge heat islands",
    accent: "#e58a24",
    districts: [
      { name: "Nieuw-West", score: 86, x: 24, y: 51, description: "Large post-war estates with hot paved courtyards.", heat: 89, poverty: 78, elderly: 38, housing: 84, green: 34 },
      { name: "Noord", score: 72, x: 52, y: 22, description: "Fast-growing neighborhoods facing uneven cooling access.", heat: 75, poverty: 62, elderly: 32, housing: 70, green: 48 },
      { name: "Zuidoost", score: 82, x: 76, y: 70, description: "Heat stress concentrated around dense housing and transit.", heat: 86, poverty: 73, elderly: 35, housing: 80, green: 39 },
      { name: "Oost", score: 69, x: 70, y: 45, description: "Mixed-density district with vulnerable hard-surface zones.", heat: 72, poverty: 55, elderly: 40, housing: 68, green: 46 },
      { name: "Centrum", score: 63, x: 49, y: 50, description: "Tourist-heavy core with high pavement and crowd load.", heat: 71, poverty: 44, elderly: 29, housing: 61, green: 41 },
      { name: "Zuid", score: 38, x: 52, y: 76, description: "Leafier streets and strong access to cooling infrastructure.", heat: 42, poverty: 25, elderly: 47, housing: 46, green: 78 },
    ],
  },
  Istanbul: {
    country: "Türkiye",
    flag: "🇹🇷",
    subtitle: "Extreme density / northern green belt",
    accent: "#ef7438",
    districts: [
      { name: "Bağcılar", score: 96, x: 29, y: 39, description: "Very dense housing with severe heat and low green coverage.", heat: 96, poverty: 84, elderly: 27, housing: 91, green: 14 },
      { name: "Esenler", score: 91, x: 47, y: 33, description: "Dense central-western fabric and strong summer heat exposure.", heat: 91, poverty: 81, elderly: 30, housing: 88, green: 18 },
      { name: "Fatih", score: 93, x: 65, y: 44, description: "Historic dense core with intense pavement and population pressure.", heat: 93, poverty: 69, elderly: 44, housing: 86, green: 16 },
      { name: "Kadıköy", score: 74, x: 73, y: 72, description: "Dense waterfront district with mixed cooling access.", heat: 78, poverty: 48, elderly: 43, housing: 74, green: 39 },
      { name: "Üsküdar", score: 67, x: 79, y: 55, description: "Hilly neighborhoods with mixed tree cover and exposure.", heat: 70, poverty: 45, elderly: 46, housing: 67, green: 48 },
      { name: "Northern Belt", score: 39, x: 60, y: 17, description: "Forested northern edge with lower urban heat intensity.", heat: 42, poverty: 32, elderly: 25, housing: 38, green: 86 },
    ],
  },
  Izmir: {
    country: "Türkiye",
    flag: "🇹🇷",
    subtitle: "Aegean bay / dry summer exposure",
    accent: "#e46c3b",
    districts: [
      { name: "Buca", score: 92, x: 54, y: 63, description: "Dense hillside housing with severe summer heat exposure.", heat: 94, poverty: 78, elderly: 34, housing: 87, green: 23 },
      { name: "Konak", score: 86, x: 35, y: 52, description: "Dense waterfront core with high pavement and heat retention.", heat: 89, poverty: 63, elderly: 49, housing: 81, green: 28 },
      { name: "Karabağlar", score: 90, x: 38, y: 73, description: "Large residential district with uneven shade and cooling access.", heat: 92, poverty: 81, elderly: 39, housing: 86, green: 21 },
      { name: "Bornova", score: 78, x: 67, y: 50, description: "Valley district with heat pockets around dense corridors.", heat: 81, poverty: 58, elderly: 35, housing: 74, green: 34 },
      { name: "Karşıyaka", score: 61, x: 72, y: 30, description: "Coastal neighborhoods benefit from breezes but remain heat-sensitive.", heat: 66, poverty: 43, elderly: 46, housing: 63, green: 47 },
      { name: "Urla Belt", score: 35, x: 20, y: 82, description: "Lower-density green edge with much stronger natural cooling.", heat: 39, poverty: 29, elderly: 42, housing: 41, green: 82 },
    ],
  },
};

const eventNames = [
  "Heatwave", "Elderly Crisis", "Developer Pressure", "Algorithm Blind Spot",
  "Protest Erupts", "Housing Crisis", "Power Grid Failure", "Media Scandal",
  "Budget Crisis", "City Council Showdown", "Public Health Emergency", "Election Campaign",
];

const choices: Choice[] = [
  {
    title: "Audit the AI system", icon: "⚖", body: "Launch an independent audit and publish the results before the next forecast.",
    effects: "Justice +15 · Trust +10 · Health +4", cost: 12,
    apply: s => ({...s, justice: Math.min(100,s.justice+15), trust: Math.min(100,s.trust+10), health: Math.min(100,s.health+4), lives:s.lives+80}),
  },
  {
    title: "Increase dataset diversity", icon: "◉", body: "Fund local data collection and community reporting in overlooked neighborhoods.",
    effects: "Justice +10 · Approval +8 · Green +3", cost: 18,
    apply: s => ({...s, justice: Math.min(100,s.justice+10), approval: Math.min(100,s.approval+8), green: Math.min(100,s.green+3), lives:s.lives+105}),
  },
  {
    title: "Trust the system", icon: "♙", body: "Keep the model unchanged and preserve fiscal room for the next crisis.",
    effects: "Budget +8 · Trust −10 · Justice −8", cost: 0,
    apply: s => ({...s, budget: Math.min(100,s.budget+8), trust: Math.max(0,s.trust-10), justice: Math.max(0,s.justice-8), lives:s.lives+15}),
  },
  {
    title: "Blame the vendors", icon: "📣", body: "Hold a press conference and shift responsibility to the technology provider.",
    effects: "Approval +5 · Trust −5 · Council +2", cost: 4,
    apply: s => ({...s, approval: Math.min(100,s.approval+5), trust: Math.max(0,s.trust-5), council: Math.min(100,s.council+2), lives:s.lives+30}),
  },
  {
    title: "Create a community panel", icon: "👥", body: "Give residents a formal role in reviewing AI recommendations with officials.",
    effects: "Approval +10 · Trust +8 · Council −6", cost: 6,
    apply: s => ({...s, approval: Math.min(100,s.approval+10), trust: Math.min(100,s.trust+8), council: Math.max(0,s.council-6), lives:s.lives+70}),
  },
];

function tone(score:number) {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function clamp(n:number) { return Math.max(0, Math.min(100,n)); }

function Metric({icon,label,value,unit="/100"}:{icon:string;label:string;value:number;unit?:string}) {
  return <div className="metric"><span className="metricIcon">{icon}</span><div><span className="metricLabel">{label}</span><strong>{value}<small>{unit}</small></strong></div></div>;
}

function CityMap({
  city,
  selected,
  onSelect,
}: {
  city: CityKey;
  selected: District;
  onSelect: (d:District)=>void;
}) {
  const districts = cityData[city].districts;

  return (
    <div className={`map ${city.toLowerCase()}`}>
      <div className="mapLandscape">
        <div className="waterShape" />
        <div className="greenZone z1" /><div className="greenZone z2" /><div className="greenZone z3" />
        <div className="cityTexture" />
        {Array.from({length:18}).map((_,i)=><span key={`r${i}`} className="roadLine" style={{transform:`rotate(${i*11-25}deg)`,top:`${10+i*4}%`}} />)}
        {Array.from({length:14}).map((_,i)=><span key={`c${i}`} className="cityBlock" style={{left:`${8+(i*17)%84}%`,top:`${18+(i*29)%66}%`,transform:`rotate(${i*13}deg)`}} />)}
      </div>

      <div className="mapOverlay" />
      <div className="mapTitle">
        <span>PRIORITY MAP</span>
        <h2>Who should be cooled first?</h2>
      </div>

      <div className="legend">
        <b>RISK LEVEL</b>
        <span><i className="legendDot low"/>Low</span>
        <span><i className="legendDot medium"/>Medium</span>
        <span><i className="legendDot high"/>High</span>
        <span><i className="legendDot critical"/>Very High</span>
      </div>

      <button className="mapTool target">⌾</button>
      <button className="mapTool layers">▱</button>
      <div className="zoom"><button>+</button><button>−</button></div>

      {districts.map(d => {
        const selectedNow = selected.name === d.name;
        return (
          <button
            key={d.name}
            className={`pin ${tone(d.score)} ${selectedNow ? "selected" : ""}`}
            style={{left:`${d.x}%`,top:`${d.y}%`}}
            onClick={()=>onSelect(d)}
            aria-label={`Select ${d.name}`}
          >
            <span>{d.score}</span>
            <em>{d.name}</em>
          </button>
        );
      })}

      <div className="mapInfo">
        <span className="mapInfoLabel">SELECTED HOTSPOT</span>
        <strong>{selected.name}</strong>
        <small>{selected.description}</small>
        <div className="infoGrid">
          <span>🌡 Heat <b>{selected.heat}</b></span>
          <span>🏠 Housing <b>{selected.housing}</b></span>
          <span>👴 Elderly <b>{selected.elderly}</b></span>
          <span>🌳 Green <b>{selected.green}</b></span>
        </div>
      </div>
    </div>
  );
}

export default function MayorGame() {
  const [city, setCity] = useState<CityKey>("Brussels");
  const [selected, setSelected] = useState(cityData.Brussels.districts[0]);
  const [turn, setTurn] = useState(1);
  const [chosen, setChosen] = useState<number|null>(null);
  const [stats, setStats] = useState<Stats>({
    budget:100, heat:68, justice:50, approval:60, trust:60, council:55, green:35, health:55, lives:1248
  });
  const [log, setLog] = useState<string[]>([]);

  const data = cityData[city];

  const stakeholder = useMemo(() => ({
    Citizens: Math.round((stats.approval+stats.trust)/2),
    Activists: stats.justice,
    Developers: clamp(stats.budget+2),
    Media: clamp(stats.approval-11),
    Council: stats.council
  }), [stats]);

  function changeCity(next:CityKey) {
    setCity(next);
    setSelected(cityData[next].districts[0]);
    setTurn(1);
    setChosen(null);
    setStats({budget:100,heat:68,justice:50,approval:60,trust:60,council:55,green:35,health:55,lives:1248});
    setLog([]);
  }

  function choose(index:number) {
    if(chosen!==null) return;
    const c=choices[index];
    if(c.cost>stats.budget) return;
    const afterCost={...stats,budget:stats.budget-c.cost};
    const result=c.apply(afterCost);
    setStats(result);
    setChosen(index);
    setLog(old=>[`${data.country} · Turn ${turn}: ${c.title} in ${selected.name}`,...old].slice(0,8));
  }

  function nextTurn() {
    if(chosen===null) return;
    setTurn(t=>Math.min(12,t+1));
    setChosen(null);
    setStats(s=>({
      ...s,
      budget:clamp(s.budget-3),
      heat:clamp(s.heat+(turn%3===0?4:-2)),
      health:clamp(s.health+(s.green>50?2:-1)),
      approval:clamp(s.approval+(s.trust>60?1:-1)),
    }));
  }

  const selectedPriority = Math.round((selected.heat+selected.poverty+selected.housing+(100-selected.green))/4);
  const cityLabel = city === "Istanbul" ? "ISTANBUL" : city === "Izmir" ? "IZMIR" : city.toUpperCase();

  return (
    <main className="game">
      <style>{css}</style>

      <header className="topbar">
        <div className="turn"><b>TURN {turn} / 12</b><span>{eventNames[turn-1]}</span></div>
        <Metric icon="🪙" label="BUDGET" value={stats.budget} unit="M €"/>
        <Metric icon="🌡" label="HEAT" value={stats.heat}/>
        <Metric icon="⚖" label="JUSTICE" value={stats.justice}/>
        <Metric icon="👥" label="APPROVAL" value={stats.approval}/>
        <Metric icon="🤝" label="TRUST" value={stats.trust}/>
        <Metric icon="🏛" label="COUNCIL" value={stats.council}/>
        <button className="advisor">🤖 AI ADVISOR</button>
        <button className="settings">⚙</button>
      </header>

      <section className="cityBar">
        <div className="crown">👑</div>
        <div><b>{data.flag} {cityLabel} · MAYOR EXECUTIVE MODE</b><span>Turn {turn} / 12 · City Council in Session</span></div>
        <div className="cityPicker">
          {(Object.keys(cityData) as CityKey[]).map(c=>
            <button key={c} className={city===c?"active":""} onClick={()=>changeCity(c)}>{cityData[c].flag} {c}</button>
          )}
        </div>
        <strong>€{stats.budget}M remaining</strong>
      </section>

      <section className="workspace">
        <aside className="leftRail">
          <div className="cityCard">
            <div className={`cityPhoto ${city.toLowerCase()}`} />
            <b>{cityLabel} {data.flag}</b>
            <span>{data.subtitle}</span>
          </div>

          <div className="panel">
            <h3>CITY PULSE</h3>
            {[
              ["⚡","Heat risk",stats.heat],
              ["⚖","Spatial justice",stats.justice],
              ["♧","Public approval",stats.approval],
              ["♡","Citizen trust",stats.trust],
              ["⚒","Council support",stats.council],
              ["♧","Green coverage",stats.green],
              ["♙","Health capacity",stats.health],
            ].map(([icon,label,value])=>
              <div className="pulse" key={String(label)}>
                <div><span>{icon} {label}</span><b>{value}</b></div>
                <i><b style={{width:`${value}%`}}/></i>
              </div>
            )}
          </div>

          <div className="budgetCard">
            <span>🪙 BUDGET OFFICE</span>
            <strong>€{stats.budget}M</strong>
            <p>Spend now, pay later — or preserve fiscal room for the next crisis.</p>
          </div>

          <div className="panel">
            <h3>DISTRICT RISK OVERVIEW</h3>
            {data.districts.map(d=>
              <button className="riskRow" key={d.name} onClick={()=>setSelected(d)}>
                <i className={`score ${tone(d.score)}`}>{d.score}</i>
                <span>{d.name}</span>
                <em>{tone(d.score)==="critical"?"Very High":tone(d.score)}</em>
              </button>
            )}
          </div>

          <div className="panel aiPanel">
            <span className="aiIcon">✦</span>
            <h3>AI PRIORITY SUGGESTION</h3>
            <p>Models predict the highest heat-health burden in <b>{data.districts[0].name}</b>. Prioritize it?</p>
            <button onClick={()=>setSelected(data.districts[0])}>Analyze {data.districts[0].name}</button>
          </div>

          <div className="panel">
            <h3>STAKEHOLDER MOOD</h3>
            {Object.entries(stakeholder).map(([k,v])=>
              <div className="mood" key={k}><span>{k==="Citizens"?"👥":k==="Activists"?"🌱":k==="Developers"?"🏢":k==="Media"?"📺":"🏛"} {k}</span><i><b style={{width:`${v}%`}}/></i><strong>{v}</strong></div>
            )}
          </div>
        </aside>

        <section className="mapColumn">
          <CityMap city={city} selected={selected} onSelect={setSelected}/>
          <div className="selectedDistrict">
            <div><small>SELECTED DISTRICT</small><h2>{selected.name}</h2><p>AI priority score: <b>{selectedPriority} / 100</b></p></div>
            <button>CLICK A MAP PIN</button>
          </div>
        </section>

        <aside className="eventPanel">
          <div className="eventHead">
            <span>♨ CURRENT EVENT · {data.flag} {cityLabel}</span>
            <h1>{eventNames[turn-1].toUpperCase()}</h1>
            <p>{turn===4
              ? "Your AI system failed to detect a rapidly heating microclimate in low-income areas. The public is asking tough questions."
              : `Meteorologists forecast another dangerous period. ${selected.name} is now demanding a visible response from city hall.`}
            </p>
          </div>
          <h3 className="chooseLabel">Choose your response:</h3>
          <div className="choices">
            {choices.map((c,i)=>
              <button key={c.title} className={`choice ${chosen===i?"chosen":""} ${chosen!==null&&chosen!==i?"muted":""}`} onClick={()=>choose(i)}>
                <div className="choiceIcon">{c.icon}</div>
                <div className="choiceCopy"><strong>{c.title}</strong><p>{c.body}</p><span>{c.effects}</span></div>
                <b className="cost">Cost: {c.cost}M €</b>
              </button>
            )}
          </div>
          <div className="decisionLog">
            <b>DECISION LOG</b>
            {log.length===0?<span>Your first decision will appear here.</span>:log.map((x,i)=><p key={i}>{x}</p>)}
          </div>
        </aside>
      </section>

      <section className="timeline">
        <div className="timelineTitle">GAME TIMELINE</div>
        {eventNames.map((x,i)=>
          <div key={x} className={`step ${i===turn-1?"active":i<turn-1?"done":"locked"}`}>
            <b>{i+1}</b><span>{x}</span>{i<turn-1&&<em>✓</em>}{i>turn-1&&<em>⌁</em>}
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="life"><small>♥ LIVES SAVED</small><strong>{stats.lives.toLocaleString()}</strong><span>vs. projected baseline</span></div>
        <div className="legacy"><span>♛</span><div><small>YOUR LEGACY SO FAR</small><p>{stats.justice>70?"Justice-first leadership is becoming your signature.":stats.approval>70?"The public is responding to your visible action.":"You're balancing climate action with political survival."}</p></div></div>
        <div className="next"><div><small>NEXT TURN PREVIEW</small><p>{turn===12?"Election campaign opens. Your record will be judged.":"New pressure is building after today's controversial decision."}</p></div><button onClick={nextTurn} disabled={chosen===null || turn===12}>Prepare for Next Turn <b>→</b></button></div>
      </footer>
    </main>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
:root{--bg:#061017;--panel:#0d1821;--line:#26353e;--text:#f5f7f8;--muted:#9ba8af;--purple:#8171ff;--green:#49c878;--orange:#f6a316;--red:#ee3431}*{box-sizing:border-box}body{margin:0;background:#050c11;color:var(--text);font-family:'DM Sans',sans-serif}.game{min-height:100vh;background:radial-gradient(circle at 50% 18%,#172731,#071018 50%,#04090d);overflow:hidden}.topbar{height:72px;display:flex;align-items:center;gap:8px;padding:0 18px;border-bottom:1px solid #26333c;background:#08121a;position:sticky;top:0;z-index:30}.turn{width:190px;border-right:1px solid #26343d;display:flex;flex-direction:column;gap:3px}.turn b{font:700 16px 'Space Grotesk';letter-spacing:.04em}.turn span{font-size:12px;color:#aebbc2}.metric{min-width:105px;height:52px;display:flex;align-items:center;gap:7px;padding:0 6px}.metricIcon{font-size:20px}.metricLabel{display:block;color:#9ba7af;font-size:9px;font-weight:700;letter-spacing:.08em}.metric strong{font:700 18px 'Space Grotesk';color:#f7bf42}.metric:nth-child(4) strong{color:#ff6565}.metric:nth-child(5) strong{color:#a98bff}.metric:nth-child(6) strong{color:#58a0ff}.metric:nth-child(7) strong{color:#5de1b0}.metric:nth-child(8) strong{color:#f6a316}.metric small{font:500 10px 'DM Sans';color:#91a0a9;margin-left:2px}.advisor{margin-left:auto;border:1px solid #4b45d5;background:#15194b;color:#e9e8ff;border-radius:8px;padding:11px 14px;font-weight:700}.settings{border:1px solid #273640;background:#0d1720;color:#d9e2e7;border-radius:50%;width:40px;height:40px;margin-left:5px}.cityBar{max-width:1700px;margin:14px auto 0;padding:12px 18px;display:flex;align-items:center;gap:12px;border:1px solid #2a353b;background:#f8f8f5;color:#172033;border-radius:14px}.cityBar .crown{width:40px;height:40px;border-radius:50%;background:#050b18;display:grid;place-items:center;font-size:20px}.cityBar>div:nth-child(2){display:flex;flex-direction:column}.cityBar>div:nth-child(2) b{font:700 15px 'Space Grotesk'}.cityBar>div:nth-child(2) span{font-size:11px;color:#9b9a96;margin-top:2px}.cityPicker{margin-left:auto;display:flex;gap:5px}.cityPicker button{border:1px solid #d8d9d5;background:#fff;border-radius:7px;padding:7px 9px;font-size:10px;font-weight:700;color:#5e6570;cursor:pointer}.cityPicker button.active{background:#141c2a;color:#fff;border-color:#141c2a}.cityBar>strong{margin-left:10px;background:#050b18;color:white;border-radius:12px;padding:10px 14px;font:700 14px 'Space Grotesk';white-space:nowrap}.workspace{display:grid;grid-template-columns:280px minmax(520px,1fr) 390px;gap:12px;padding:12px 16px 10px;max-width:1700px;margin:auto}.leftRail{display:flex;flex-direction:column;gap:10px}.cityCard,.panel,.eventPanel,.selectedDistrict{border:1px solid var(--line);background:linear-gradient(180deg,#101b24,#0b151d);border-radius:13px;box-shadow:0 16px 45px rgba(0,0,0,.22)}.cityCard{padding:10px;position:relative;overflow:hidden}.cityPhoto{height:96px;border-radius:8px;margin-bottom:9px;position:relative;overflow:hidden;background:linear-gradient(135deg,#264e57,#162c35)}.cityPhoto:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,rgba(86,185,110,.65),transparent 26%),radial-gradient(circle at 75% 65%,rgba(236,135,52,.6),transparent 27%),linear-gradient(145deg,transparent 40%,rgba(10,60,75,.9) 41% 49%,transparent 50%)}.cityPhoto.brussels:after{content:'BRUSSELS';position:absolute;left:12px;bottom:9px;font:700 19px 'Space Grotesk';color:white}.cityPhoto.amsterdam:after{content:'AMSTERDAM';position:absolute;left:12px;bottom:9px;font:700 19px 'Space Grotesk';color:white}.cityPhoto.istanbul:after{content:'ISTANBUL';position:absolute;left:12px;bottom:9px;font:700 19px 'Space Grotesk';color:white}.cityPhoto.izmir:after{content:'IZMIR';position:absolute;left:12px;bottom:9px;font:700 19px 'Space Grotesk';color:white}.cityCard>b{font:700 14px 'Space Grotesk';display:block}.cityCard span{font-size:11px;color:#a8b4bb;display:block;margin-top:4px}.panel{padding:13px}.panel h3{font-size:10px;letter-spacing:.08em;color:#8e9aa1;margin:0 0 10px}.pulse{margin:9px 0}.pulse>div{display:flex;justify-content:space-between;font-size:11px;color:#bfc8cd}.pulse>div b{font-size:11px;color:#e8edf0}.pulse i{height:7px;background:#26333a;border-radius:9px;overflow:hidden;display:block;margin-top:6px}.pulse i b{height:100%;display:block;background:#6a7075;border-radius:9px}.budgetCard{border-radius:15px;background:#030817;color:#fff;padding:17px 16px}.budgetCard span{font-size:10px;font-weight:800;color:#e0e4e8}.budgetCard strong{display:block;font:700 32px 'Space Grotesk';margin:12px 0 4px}.budgetCard p{font-size:10px;color:#a8b1b7;line-height:1.45;margin:0}.riskRow{width:100%;display:grid;grid-template-columns:31px 1fr auto;align-items:center;gap:7px;background:none;border:0;color:#f2f4f5;text-align:left;padding:6px 0;cursor:pointer}.riskRow span{font-size:11px;font-weight:600}.riskRow em{font-size:9px;font-style:normal;color:#f04a44}.score{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:9px;font-weight:800;color:#fff}.score.critical{background:#e72f2f}.score.high{background:#f3a10f}.score.medium{background:#d9aa1e}.score.low{background:#168d75}.aiPanel{position:relative;background:linear-gradient(145deg,#0d1926,#101632)}.aiPanel .aiIcon{position:absolute;right:14px;top:13px;color:#756bff;font-size:23px}.aiPanel h3{color:#6b8fff}.aiPanel p{font-size:11px;line-height:1.45;color:#b8c2c8}.aiPanel button{width:100%;border:0;background:linear-gradient(90deg,#6656e8,#3b5ce0);color:white;border-radius:6px;padding:8px;font-weight:700;font-size:11px;cursor:pointer}.mood{display:grid;grid-template-columns:94px 1fr 22px;align-items:center;gap:5px;margin:8px 0;font-size:10px;color:#cbd3d7}.mood i{height:5px;background:#26343b;border-radius:9px;overflow:hidden}.mood i b{height:100%;display:block;background:#62b874;border-radius:9px}.mood strong{font-size:10px;text-align:right}.mapColumn{min-width:0}.map{height:620px;border:1px solid #2c3a41;border-radius:15px;overflow:hidden;position:relative;background:#163e48;box-shadow:0 20px 50px rgba(0,0,0,.3)}.mapLandscape{position:absolute;inset:0;overflow:hidden;background:linear-gradient(140deg,#587568 0%,#738476 35%,#324f51 100%)}.mapLandscape:before{content:'';position:absolute;inset:-20%;background:repeating-linear-gradient(18deg,transparent 0 38px,rgba(255,255,255,.045) 39px 41px),repeating-linear-gradient(108deg,transparent 0 64px,rgba(0,0,0,.07) 65px 67px);transform:rotate(-7deg)}.cityTexture{position:absolute;inset:8% 5%;background-image:radial-gradient(circle,rgba(28,39,39,.52) 0 1.2px,transparent 1.7px),radial-gradient(circle,rgba(222,211,177,.36) 0 1px,transparent 1.6px);background-size:8px 8px,11px 11px;opacity:.8;filter:blur(.2px)}.waterShape{position:absolute;background:#0b4b5e;box-shadow:0 0 20px rgba(0,0,0,.35)}.brussels .waterShape{width:19%;height:82%;left:39%;top:6%;border-radius:52% 46% 61% 38%;transform:rotate(11deg);opacity:.9}.amsterdam .waterShape{width:34%;height:118%;left:35%;top:-8%;border-radius:48% 52% 50% 48%;transform:rotate(-7deg);opacity:.95}.istanbul .waterShape{width:21%;height:112%;left:50%;top:-7%;border-radius:46% 54% 51% 49%;transform:rotate(5deg);opacity:.98}.izmir .waterShape{width:44%;height:92%;left:-8%;top:10%;border-radius:55% 45% 61% 39%;transform:rotate(4deg);opacity:.98}.greenZone{position:absolute;background:rgba(61,122,65,.68);filter:blur(1px)}.z1{width:27%;height:23%;right:4%;top:4%;border-radius:47% 53% 45% 55%}.z2{width:22%;height:18%;left:7%;bottom:5%;border-radius:53% 47% 58% 42%}.z3{width:19%;height:15%;right:19%;bottom:10%;border-radius:45% 55% 52% 48%}.brussels .z1{width:34%;height:20%;right:0;top:2%}.amsterdam .z2{left:3%;bottom:15%;width:29%;height:22%}.istanbul .z1{width:41%;height:27%;right:0;top:0}.istanbul .z2{width:27%;height:17%;left:4%;bottom:4%}.izmir .z3{width:34%;height:22%;right:2%;bottom:2%}.roadLine{position:absolute;left:-10%;width:120%;height:2px;background:rgba(225,215,188,.42);box-shadow:0 0 2px rgba(0,0,0,.4)}.cityBlock{position:absolute;width:15%;height:4%;border:1px solid rgba(236,224,196,.3);background:rgba(51,62,57,.35);border-radius:2px}.mapOverlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,12,14,.12),rgba(5,12,14,.28))}.mapTitle{position:absolute;left:18px;top:18px;background:rgba(248,249,247,.96);color:#101a2a;border-radius:12px;padding:14px 18px;z-index:5}.mapTitle span{font-size:10px;color:#8e9696;font-weight:800;letter-spacing:.1em}.mapTitle h2{font:700 25px 'Space Grotesk';margin:6px 0 0}.legend{position:absolute;left:18px;bottom:18px;display:flex;gap:12px;align-items:center;background:rgba(7,13,15,.88);border:1px solid #34444b;padding:10px 12px;border-radius:8px;font-size:9px;z-index:6}.legend b{font-size:9px}.legend span{display:flex;align-items:center;gap:4px;color:#dce1e2}.legendDot{width:9px;height:9px;border-radius:50%;display:inline-block}.legendDot.low{background:#48a53d}.legendDot.medium{background:#ffbd21}.legendDot.high{background:#f47e0b}.legendDot.critical{background:#e82f2c}.mapTool{position:absolute;right:16px;width:42px;height:42px;border-radius:8px;border:1px solid #42525a;background:#07131a;color:#fff;font-size:21px;z-index:8}.target{top:18px}.layers{top:68px}.zoom{position:absolute;right:16px;top:120px;z-index:8;display:flex;flex-direction:column}.zoom button{width:42px;height:42px;border:1px solid #42525a;background:#07131a;color:#fff;font-size:22px}.zoom button:first-child{border-radius:8px 8px 0 0}.zoom button:last-child{border-radius:0 0 8px 8px;border-top:0}.pin{position:absolute;transform:translate(-50%,-50%);width:58px;height:58px;border:4px solid rgba(255,255,255,.95);border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px;box-shadow:0 10px 22px rgba(0,0,0,.38);cursor:pointer;transition:.2s;z-index:7}.pin:hover,.pin.selected{transform:translate(-50%,-50%) scale(1.11);box-shadow:0 0 0 4px rgba(255,183,88,.85),0 15px 28px rgba(0,0,0,.5)}.pin.critical{background:#e72b2a}.pin.high{background:#f6a10d}.pin.medium{background:#d9a51c}.pin.low{background:#128b7f}.pin em{position:absolute;top:-24px;white-space:nowrap;font-style:normal;font-size:10px;text-shadow:0 2px 5px #000}.mapInfo{position:absolute;left:18px;bottom:68px;width:265px;background:rgba(4,10,12,.91);border:1px solid #3a4a52;border-radius:9px;padding:12px;z-index:9}.mapInfoLabel{font-size:9px;color:#d9794b;font-weight:800;letter-spacing:.08em}.mapInfo strong{display:block;font:700 17px 'Space Grotesk';margin-top:5px}.mapInfo small{display:block;color:#b6c1c5;font-size:9px;line-height:1.35;margin-top:4px}.infoGrid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:9px;font-size:9px;color:#b8c2c6}.infoGrid b{color:#fff}.selectedDistrict{margin-top:10px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}.selectedDistrict small{color:#d76d4a;font-weight:800;font-size:10px;letter-spacing:.09em}.selectedDistrict h2{font:700 27px 'Space Grotesk';margin:5px 0}.selectedDistrict p{margin:0;color:#89979f;font-size:12px}.selectedDistrict button{background:#1a2329;color:#8f999f;border:0;border-radius:22px;padding:14px 18px;font-weight:800}.eventPanel{padding:18px;height:fit-content;min-height:620px;border-color:#d66e2c;background:linear-gradient(180deg,#0e1820,#091219)}.eventHead>span{font-size:10px;font-weight:800;color:#ef7d43;letter-spacing:.08em}.eventHead h1{font:700 25px 'Space Grotesk';margin:16px 0 10px}.eventHead p{font-size:12px;line-height:1.55;color:#bdc7cb;margin-bottom:18px}.chooseLabel{font-size:11px;color:#d7dfe2;margin:0 0 9px}.choices{display:flex;flex-direction:column;gap:8px}.choice{position:relative;text-align:left;display:grid;grid-template-columns:32px 1fr auto;gap:9px;padding:12px 10px;border-radius:10px;border:1px solid #2d3941;background:linear-gradient(135deg,#1a242c,#121b22);color:white;cursor:pointer;transition:.18s}.choice:hover,.choice.chosen{border-color:#746cff;box-shadow:0 0 0 1px #746cff inset;background:#222632}.choice.muted{opacity:.45}.choiceIcon{font-size:19px}.choiceCopy strong{font-size:13px}.choiceCopy p{font-size:10px;line-height:1.4;color:#aeb9bf;margin:5px 0}.choiceCopy span{font-size:9px;color:#65d9e2}.cost{font-size:9px;align-self:end;color:#7ff0ba;border:1px solid #24865e;border-radius:6px;padding:5px 7px;white-space:nowrap}.decisionLog{margin-top:13px;border-top:1px solid #29363e;padding-top:11px}.decisionLog>b{font-size:9px;letter-spacing:.08em;color:#9ca8ad}.decisionLog span,.decisionLog p{display:block;color:#7f8c93;font-size:9px;line-height:1.35;margin:7px 0}.timeline{height:68px;margin:0 16px 10px;border:1px solid #29363e;background:#eef0ee;color:#1a2429;border-radius:10px;display:grid;grid-template-columns:120px repeat(12,1fr);overflow:hidden}.timelineTitle{padding:12px 15px;font-size:9px;font-weight:800;color:#7b8588}.step{position:relative;padding:9px 6px 5px;border-left:1px solid #d5dad8;display:flex;flex-direction:column;gap:3px;justify-content:center;font-size:8px}.step b{font-size:9px;color:#667176}.step em{position:absolute;right:5px;top:5px;font-style:normal;font-size:9px}.step.done{background:#e4e8e5}.step.active{background:#d9d7ff;color:#28255b}.step.locked{color:#899195}.footer{display:grid;grid-template-columns:260px 1fr 1.2fr;gap:10px;padding:0 16px 16px}.life,.legacy,.next{min-height:72px;border:1px solid #27353e;border-radius:10px;background:#0b151d;padding:12px 15px;display:flex;align-items:center}.life{flex-direction:column;align-items:flex-start;justify-content:center}.life small,.legacy small,.next small{font-size:9px;color:#839098;font-weight:800;letter-spacing:.06em}.life strong{font:700 19px 'Space Grotesk';color:#fff}.life span{font-size:9px;color:#77848b}.legacy{gap:14px}.legacy>span{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#c99420;color:#fff;font-size:20px}.legacy p,.next p{margin:5px 0 0;font-size:10px;color:#aeb9be;line-height:1.35}.next{justify-content:space-between}.next button{border:0;border-radius:7px;background:linear-gradient(90deg,#5042c9,#314ed8);color:white;padding:12px 14px;font-weight:800;white-space:nowrap;cursor:pointer}.next button:disabled{opacity:.35;cursor:not-allowed}.next button b{margin-left:15px;font-size:16px}@media(max-width:1250px){.workspace{grid-template-columns:230px 1fr}.eventPanel{grid-column:1/-1}.cityPicker{display:none}.timeline{grid-template-columns:80px repeat(12,1fr)}}@media(max-width:800px){.topbar{overflow:auto}.cityBar{margin:8px}.cityBar>strong{display:none}.workspace{grid-template-columns:1fr}.leftRail{order:2}.mapColumn{order:1}.eventPanel{order:3}.map{height:520px}.timeline{overflow:auto;grid-template-columns:90px repeat(12,100px)}.footer{grid-template-columns:1fr}.mapInfo{left:18px;bottom:62px}.pin em{display:none}}
`;

