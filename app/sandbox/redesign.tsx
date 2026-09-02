'use client';

import { useMemo, useState } from 'react';

type Stats = { budget:number; heat:number; justice:number; approval:number; trust:number; council:number; green:number; health:number; lives:number };
type District = { name:string; score:number; lat:number; lng:number; description:string; heat:number; poverty:number; elderly:number; housing:number; green:number; population:string };
type Choice = { title:string; body:string; effects:string; cost:number; apply:(stats:Stats)=>Stats };
type City = { country:string; subtitle:string; center:[number,number]; zoom:number; districts:District[] };
type Props = { cityData:Record<string,City>; getChoices:(turn:number)=>Choice[] };

const INITIAL:Stats = { budget:76, heat:78, justice:50, approval:56, trust:58, council:50, green:36, health:55, lives:0 };

export default function GameRedesign({ cityData, getChoices }:Props) {
  const cities = Object.keys(cityData);
  const [city,setCity] = useState(cities.includes('Brussels') ? 'Brussels' : cities[0]);
  const [districtIndex,setDistrictIndex] = useState(0);
  const [turn,setTurn] = useState(1);
  const [stats,setStats] = useState(INITIAL);
  const [choice,setChoice] = useState<number|null>(null);
  const [started,setStarted] = useState(false);
  const [finished,setFinished] = useState(false);
  const [history,setHistory] = useState<string[]>([]);
  const cityObject = cityData[city];
  const district = cityObject.districts[districtIndex] || cityObject.districts[0];
  const choices = getChoices(turn);
  const profile = stats.justice >= 65 ? 'Redistributive mandate' : stats.heat <= 55 ? 'Heat reduction mandate' : 'Compromise mandate';

  const map = useMemo(() => {
    const points = cityObject.districts.map((item,index)=>({name:item.name,lat:item.lat,lng:item.lng,score:item.score,index}));
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>html,body,#m{height:100%;margin:0}.leaflet-container{font-family:Arial;background:#e7e3da}.leaflet-control-zoom a{border-radius:0!important;color:#111!important}.p{width:34px;height:34px;border:1px solid #111;border-radius:50%;display:grid;place-items:center;background:#1746d1;color:#fff;font:700 11px Arial;box-shadow:0 0 0 5px rgba(243,240,232,.8)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{border-radius:0;background:#f3f0e8;color:#111}</style></head><body><div id="m"></div><script>const m=L.map('m').setView([${cityObject.center[0]},${cityObject.center[1]}],${cityObject.zoom});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(m);${JSON.stringify(points)}.forEach(p=>L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div class="p">'+p.score+'</div>',iconSize:[34,34]})}).addTo(m).bindPopup('<b>'+p.name+'</b><br>Simulation score '+p.score));</script></body></html>`;
  },[cityObject]);

  function select(index:number){
    if(choice!==null) return;
    const item=choices[index];
    setStats(item.apply({...stats,budget:Math.max(0,stats.budget-item.cost)}));
    setChoice(index);
    setHistory(old=>[...old,`Turn ${turn}: ${item.title}`]);
  }
  function next(){ if(turn>=12){setFinished(true);return;} setTurn(value=>value+1);setChoice(null); }
  function reset(){setTurn(1);setStats(INITIAL);setChoice(null);setHistory([]);setFinished(false);setStarted(true);}

  return <main className="game-shell">
    <header className="game-header"><a href="/">Who Gets Cooled?</a><span>Decision simulation · {String(turn).padStart(2,'0')} / 12</span><button onClick={()=>setStarted(false)}>How it works</button></header>
    <section className="game-lead"><div><p className="game-label">Play as mayor</p><h1>Every cooling decision<br/>creates a <span>trade off.</span></h1></div><p>Allocate a limited public budget across twelve turns. The simulation makes competing values visible. It does not predict real policy outcomes.</p></section>
    <section className="game-status">
      {[['Budget',stats.budget],['Heat pressure',stats.heat],['Justice',stats.justice],['Public trust',stats.trust],['Approval',stats.approval]].map(([label,value])=><div key={label as string}><span>{label}</span><strong>{value}</strong><i><b style={{width:`${value}%`}}/></i></div>)}
    </section>
    <section className="game-workspace">
      <aside className="game-place"><p className="game-label">01 · Situation</p><div className="game-city-tabs">{cities.map(name=><button className={city===name?'active':''} key={name} onClick={()=>{setCity(name);setDistrictIndex(0)}}>{name}</button>)}</div><h2>{district.name}</h2><p>{district.description}</p><dl><div><dt>Heat</dt><dd>{district.heat}</dd></div><div><dt>Poverty</dt><dd>{district.poverty}</dd></div><div><dt>Older residents</dt><dd>{district.elderly}</dd></div><div><dt>Green</dt><dd>{district.green}</dd></div></dl><div className="game-districts">{cityObject.districts.map((item,index)=><button className={districtIndex===index?'active':''} key={item.name} onClick={()=>setDistrictIndex(index)}>{String(index+1).padStart(2,'0')} {item.name}</button>)}</div></aside>
      <div className="game-map"><iframe title={`${city} simulation map`} srcDoc={map}/><span>Map © OpenStreetMap contributors · Values shown are simulation inputs</span></div>
      <section className="game-decisions"><div className="game-decision-head"><p className="game-label">02 · Decision</p><h2>{turn===1?'Set your first priority':`Turn ${turn}, choose one action`}</h2><p>Selecting an action changes the simulation indicators immediately.</p></div><div className="game-choice-list">{choices.map((item,index)=><button key={item.title} disabled={choice!==null} className={choice===index?'chosen':''} onClick={()=>select(index)}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.body}</p><small>{item.effects} · Cost {item.cost}</small></div></button>)}</div>{choice!==null&&<button className="game-next" onClick={next}>{turn===12?'Read your result':'Continue'} <span>↘</span></button>}</section>
    </section>
    <section className="game-disclosure"><p className="game-label">Read before interpreting</p><p>This is a speculative teaching simulation. District values and intervention effects are game mechanics, not forecasts, budgets or policy recommendations. The source trail for Istanbul and Izmir remains incomplete.</p></section>
    {(!started||finished)&&<div className="game-modal"><div><p className="game-label">{finished?'End of term':'Decision simulation · 12 turns'}</p><h2>{finished?profile:'Take responsibility for a city in heat.'}</h2><p>{finished?`Your choices produced this simulated policy profile. You recorded ${history.length} decisions. This is an interpretive summary, not a performance certificate.`:'You will face constrained budgets, uneven heat exposure and competing public values. There is no neutral route and no single winning score.'}</p>{finished&&<div className="game-final-stats"><span>Heat <b>{stats.heat}</b></span><span>Justice <b>{stats.justice}</b></span><span>Trust <b>{stats.trust}</b></span></div>}<button onClick={finished?reset:()=>setStarted(true)}>{finished?'Start a new term':'Begin term'} <span>↘</span></button>{!finished&&<a href="/">Return to research dashboard</a>}</div></div>}
  </main>;
}
