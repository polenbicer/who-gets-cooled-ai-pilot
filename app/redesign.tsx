'use client';

import { useEffect, useMemo, useState } from 'react';

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

type Props = {
  data: Neighbourhood[];
  coordinates: Record<string, { lat: number; lng: number }>;
  centers: Record<City, { lat: number; lng: number; zoom: number }>;
};

const CITIES: City[] = ['Brussels', 'Amsterdam', 'Istanbul', 'Izmir'];

const POLICIES: Record<Scenario, {
  short: string;
  title: string;
  heat: number;
  social: number;
  question: string;
  reading: string;
}> = {
  heat: {
    short: 'Heat first',
    title: 'Heat exposure priority',
    heat: 0.7,
    social: 0.3,
    question: 'Where is relative physical exposure highest?',
    reading: 'The rule gives greater weight to the heat proxy. Social vulnerability remains present, but secondary.',
  },
  balanced: {
    short: 'Equal weight',
    title: 'Equal weighting',
    heat: 0.5,
    social: 0.5,
    question: 'What changes when physical and social indicators count equally?',
    reading: 'The rule splits weight evenly between the heat proxy and the combined social vulnerability score.',
  },
  justice: {
    short: 'Social first',
    title: 'Social vulnerability priority',
    heat: 0.3,
    social: 0.7,
    question: 'Who has the least capacity to absorb heat risk?',
    reading: 'The rule gives greater weight to age and income vulnerability. It does not claim to measure justice in full.',
  },
};

const SOURCES: Record<City, {
  status: string;
  note: string;
  links: { label: string; href: string }[];
}> = {
  Brussels: {
    status: 'Source portals identified',
    note: 'The interface uses an impervious surface proxy. The repository identifies the source portals, but does not yet provide row level provenance for every interface observation.',
    links: [
      { label: 'Monitoring des Quartiers', href: 'https://monitoringdesquartiers.brussels/' },
      { label: 'Brussels Open Data, neighbourhood boundaries', href: 'https://opendata.brussels.be/explore/dataset/quartiers-du-monitoring-des-quartiers-ibsa-perspective-rbc/' },
    ],
  },
  Amsterdam: {
    status: 'Source portals identified',
    note: 'The interface uses a built surface proxy. The repository identifies the source portals, but does not yet provide row level provenance for every interface observation.',
    links: [
      { label: 'Onderzoek en Statistiek', href: 'https://onderzoek.amsterdam.nl/' },
      { label: 'Amsterdam key figures dashboard', href: 'https://onderzoek.amsterdam.nl/interactief/dashboard-kerncijfers' },
    ],
  },
  Istanbul: {
    status: 'Prototype extension',
    note: 'The interface contains demonstrative district scores, but the current repository does not include a complete source trail for this extension. Do not cite these values as validated findings.',
    links: [],
  },
  Izmir: {
    status: 'Prototype extension',
    note: 'The interface contains demonstrative district scores, but the current repository does not include a complete source trail for this extension. Do not cite these values as validated findings.',
    links: [],
  },
};

const ROTATING = ['technical', 'neutral', 'automatic', 'inevitable'];

function score(area: Neighbourhood, scenario: Scenario) {
  const social = (area.age + area.income) / 2;
  const policy = POLICIES[scenario];
  return area.heat * policy.heat + social * policy.social;
}

function rankFor(items: Neighbourhood[], scenario: Scenario) {
  return [...items]
    .map((area) => ({ ...area, social: (area.age + area.income) / 2, score: score(area, scenario) }))
    .sort((a, b) => b.score - a.score)
    .map((area, index) => ({ ...area, rank: index + 1 }));
}

function getColor(heat: number, social: number) {
  const h = heat < 2.5 ? 0 : heat < 4 ? 1 : 2;
  const s = social < 2.5 ? 2 : social < 4 ? 1 : 0;
  const matrix = [
    ['#75658e', '#a55376', '#ef5a3c'],
    ['#557f91', '#817682', '#bd6b62'],
    ['#26978c', '#4f8584', '#8b7078'],
  ];
  return matrix[s][h];
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="metric">
      <div className="metric-head"><span>{label}</span><strong>{value.toFixed(2)}</strong></div>
      <div className="metric-track"><span style={{ width: `${value * 20}%`, background: color }} /></div>
    </div>
  );
}

function PriorityBarChart({ ranked, activeName, onSelect }: {
  ranked: ReturnType<typeof rankFor>;
  activeName: string;
  onSelect: (name: string) => void;
}) {
  return <div className="priority-chart">
    <div className="priority-chart-head"><div><span className="control-label">Priority ranking</span><h2>Who comes first?</h2></div><div className="priority-chart-legend"><span>Priority score</span><span>Heat</span><span>Age</span><span>Income</span></div></div>
    <div className="priority-bars">{ranked.map((area)=><button key={area.name} type="button" className={activeName===area.name?'active':''} onClick={()=>onSelect(area.name)}><span className="priority-rank">{String(area.rank).padStart(2,'0')}</span><span className="priority-name">{area.name}</span><span className="priority-bar-track"><span className="priority-bar-fill" style={{width:`${(area.score/5)*100}%`}}/></span><strong className="priority-score">{area.score.toFixed(2)}</strong><span className="priority-values"><small>H {area.heat.toFixed(2)}</small><small>A {area.age.toFixed(2)}</small><small>I {area.income.toFixed(2)}</small></span></button>)}</div>
    <p className="priority-chart-note">Scores range from 1 to 5 within the selected city sample. They show relative priority, not absolute heat risk.</p>
  </div>;
}

export default function Redesign({ data, coordinates, centers }: Props) {
  const [city, setCity] = useState<City>('Brussels');
  const [scenario, setScenario] = useState<Scenario>('heat');
  const [activeName, setActiveName] = useState('');
  const [view, setView] = useState<'explore' | 'method'>('explore');
  const [word, setWord] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setWord((current) => (current + 1) % ROTATING.length), 2200);
    return () => window.clearInterval(timer);
  }, []);

  const cityItems = useMemo(() => data.filter((area) => area.city === city), [city, data]);
  const rankings = useMemo(() => ({
    heat: rankFor(cityItems, 'heat'),
    balanced: rankFor(cityItems, 'balanced'),
    justice: rankFor(cityItems, 'justice'),
  }), [cityItems]);
  const ranked = rankings[scenario];
  const active = ranked.find((area) => area.name === activeName) || ranked[0];

  const comparison = useMemo(() => ranked.map((area) => {
    const positions = (Object.keys(POLICIES) as Scenario[]).map((key) => rankings[key].find((item) => item.name === area.name)?.rank || 0);
    const span = Math.max(...positions) - Math.min(...positions);
    return { ...area, positions, span, consensus: span <= 1 && positions.reduce((a, b) => a + b, 0) / 3 <= 4 };
  }), [ranked, rankings]);

  const mapHtml = useMemo(() => {
    const center = centers[city];
    const pins = ranked.map((area) => ({
      name: area.name,
      lat: area.lat ?? coordinates[area.name]?.lat ?? center.lat,
      lng: area.lng ?? coordinates[area.name]?.lng ?? center.lng,
      score: area.score.toFixed(2),
      rank: area.rank,
      color: getColor(area.heat, area.social),
    }));
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>html,body,#map{width:100%;height:100%;margin:0}.leaflet-container{font-family:Arial,sans-serif;background:#e9e6dd}.leaflet-control-zoom a{border-radius:0!important;color:#111!important}.pin{width:31px;height:31px;border:1px solid #111;border-radius:50%;display:grid;place-items:center;color:#fff;font:700 12px Arial;box-shadow:0 0 0 4px rgba(243,240,232,.8)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{border-radius:0;background:#f3f0e8;color:#111}.leaflet-popup-content{margin:13px 15px}</style></head><body><div id="map"></div><script>const map=L.map('map',{zoomControl:true}).setView([${center.lat},${center.lng}],${center.zoom});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);const pins=${JSON.stringify(pins)};pins.forEach(p=>{const icon=L.divIcon({className:'',html:'<div class="pin" style="background:'+p.color+'">'+p.rank+'</div>',iconSize:[31,31],iconAnchor:[15,15]});L.marker([p.lat,p.lng],{icon}).addTo(map).bindPopup('<strong>'+p.name+'</strong><br>Priority score '+p.score);});</script></body></html>`;
  }, [city, ranked, centers, coordinates]);

  const policy = POLICIES[scenario];
  const source = SOURCES[city];

  return (
    <main className="research-shell">
      <header className="research-header">
        <a className="research-brand" href="#top">Who Gets Cooled?</a>
        <nav aria-label="Primary navigation">
          <button className={view === 'explore' ? 'active' : ''} onClick={() => setView('explore')}>Explore</button>
          <button className={view === 'method' ? 'active' : ''} onClick={() => setView('method')}>Method and sources</button>
          <a href="/sandbox">Policy simulation <span>↘</span></a>
        </nav>
      </header>

      {view === 'explore' ? (
        <>
          <section className="research-hero" id="top">
            <div>
              <p className="kicker">Urban heat governance pilot · 2026</p>
              <h1>A priority ranking<br />is never <span className="rotating-claim">{ROTATING[word]}</span></h1>
            </div>
            <div className="hero-note">
              <p>Compare how three explicit policy priorities change which neighbourhoods come first for urban cooling.</p>
              <span>Developed by Polen Biçer</span>
            </div>
          </section>

          <section className="how-to" aria-label="How to use this tool">
            <div><span>01</span><strong>Select a city</strong><p>Choose the urban sample you want to inspect.</p></div>
            <div><span>02</span><strong>Choose a policy logic</strong><p>Change how heat and social vulnerability are weighted.</p></div>
            <div><span>03</span><strong>Compare the result</strong><p>See which priorities remain stable and which move.</p></div>
          </section>

          <section className="analysis-workspace" aria-label="Priority analysis">
            <aside className="analysis-controls">
              <div className="analysis-control-section"><span className="control-label">01 · Select a city</span><div className="city-buttons">{CITIES.map((item)=><button key={item} type="button" className={city===item?'selected':''} onClick={()=>{setCity(item);setActiveName('')}}>{item}</button>)}</div></div>
              <div className="analysis-control-section"><span className="control-label">02 · Choose a policy logic</span><div className="policy-buttons">{(Object.keys(POLICIES) as Scenario[]).map((key)=><button key={key} type="button" className={scenario===key?'selected':''} onClick={()=>setScenario(key)}><span>{POLICIES[key].title}</span><small>{Math.round(POLICIES[key].heat*100)}% heat, {Math.round(POLICIES[key].social*100)}% social</small></button>)}</div></div>
              <div className="current-policy"><span className="control-label">Current policy logic</span><h2>{policy.title}</h2><p className="policy-question">{policy.question}</p><p className="policy-explanation">{policy.reading}</p><div className="weight-line"><span style={{width:`${policy.heat*100}%`}}>Heat {Math.round(policy.heat*100)}%</span><span style={{width:`${policy.social*100}%`}}>Social {Math.round(policy.social*100)}%</span></div></div>
              <div className="data-status"><span>{source.status}</span><b>{cityItems.length} interface observations</b><p>{source.note}</p>{source.links.length>0&&<div className="control-source-links">{source.links.map((link)=><a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>}</div>
            </aside>
            <PriorityBarChart ranked={ranked} activeName={active?.name||''} onSelect={setActiveName}/>
          </section>

          <section className="evidence-grid">
            <div className="map-panel">
              <div className="panel-heading"><span className="control-label">Spatial view</span><span>{city} · relative scores only</span></div>
              <iframe key={`${city}-${scenario}`} title={`${city} neighbourhood priority map`} srcDoc={mapHtml} />
              <p className="map-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>, ODbL.</p>
            </div>

            <div className="ranking-panel">
              <div className="panel-heading"><span className="control-label">Priority order</span><span>Click to inspect</span></div>
              <ol>{comparison.map((area) => <li key={area.name} className={active?.name === area.name ? 'active' : ''}><button onClick={() => setActiveName(area.name)}><span className="rank-number">{String(area.rank).padStart(2, '0')}</span><span className="rank-name">{area.name}<small>{area.consensus ? 'Consensus priority' : area.span >= 2 ? 'Model sensitive' : 'Stable middle'}</small></span><strong>{area.score.toFixed(2)}</strong></button></li>)}</ol>
            </div>

            {active && <aside className="inspection-panel">
              <div className="panel-heading"><span className="control-label">Selected area</span><span>Rank {active.rank}</span></div>
              <h2>{active.name}</h2>
              <p>{active.profile}</p>
              <div className="metrics">
                <Metric label="Heat proxy" value={active.heat} color="#ef5a3c" />
                <Metric label="Age vulnerability" value={active.age} color="#1746d1" />
                <Metric label="Income vulnerability" value={active.income} color="#111111" />
              </div>
              <div className="rank-comparison"><span>Heat exposure <b>#{comparison.find((x) => x.name === active.name)?.positions[0]}</b></span><span>Equal weighting <b>#{comparison.find((x) => x.name === active.name)?.positions[1]}</b></span><span>Social vulnerability <b>#{comparison.find((x) => x.name === active.name)?.positions[2]}</b></span></div>
            </aside>}
          </section>

          <section className="interpretation-band">
            <div><span className="control-label">What the similarity means</span><h2>Agreement is also a result.</h2></div>
            <div><p>If the same neighbourhoods remain near the top, the three indicators point in a similar direction. The interface does not manufacture disagreement. It shows where priorities are stable and where rankings depend on the selected policy logic.</p><button onClick={() => setView('method')}>See how the score is made <span>↘</span></button></div>
          </section>
        </>
      ) : (
        <section className="method-page">
          <header><p className="kicker">Method and sources</p><h1>Follow every choice<br />from source to rank.</h1><p>This is a pilot decision sandbox, not an operational allocation system. It uses relative scores to expose how indicator choice and policy weighting frame a public decision.</p></header>

          <div className="method-chain" aria-label="Decision chain">
            {['Municipal indicators', 'Human proxy selection', 'Within city 1 to 5 scaling', 'K means profiling', 'Policy weighting', 'Priority ranking', 'Public scrutiny'].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></div>)}
          </div>

          <div className="method-columns">
            <article><span className="control-label">Relative scoring</span><h2>What enters the model</h2><p><strong>Heat exposure</strong> uses an impervious or built surface proxy. <strong>Age vulnerability</strong> represents the relative position of residents aged 65 and older. <strong>Income vulnerability</strong> reverses relative income position, so lower income produces a higher vulnerability score.</p><code>score = 1 + 4 × (value − city minimum) / (city maximum − city minimum)</code><p>Income uses the reversed form. Scores describe position within the selected city sample. They are not temperatures and should not be compared across cities as physical measurements.</p></article>
            <article><span className="control-label">Allocation rule</span><h2>What changes</h2><p>Social vulnerability is the mean of age and income vulnerability. The three policy logics alter only the balance between heat and social vulnerability.</p><code>priority = heat × heat weight + social vulnerability × social weight</code><p>The weights are normative scenarios. They are not learned by the clustering model and they are not presented as objectively correct.</p></article>
            <article><span className="control-label">AI boundary</span><h2>What K means does</h2><p>K means groups observations with similar heat, age and income profiles. Human interpretation assigns the descriptive profile labels. The clustering does not choose the policy weights, the priority order or the meaning of justice.</p><p>With a small pilot sample, clusters are demonstrative categories, not stable urban identities.</p></article>
          </div>

          <section className="source-register">
            <div className="source-heading"><span className="control-label">Source register</span><h2>Documented origin, visible limits.</h2></div>
            {CITIES.map((item) => <article key={item}><div><h3>{item}</h3><span className={SOURCES[item].links.length ? 'source-status documented' : 'source-status pending'}>{SOURCES[item].status}</span></div><p>{SOURCES[item].note}</p><div className="source-links">{SOURCES[item].links.length ? SOURCES[item].links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>) : <span>Source documentation required before research use.</span>}</div></article>)}
          </section>

          <section className="limitations"><span className="control-label">Limits</span><ul><li>The selected observations are demonstrative, not representative city samples.</li><li>The heat variables are proxies and differ between Brussels and Amsterdam.</li><li>Source years differ across indicators.</li><li>A relative score does not measure absolute risk.</li><li>Similar rankings may reflect correlated indicators, not model failure.</li><li>Istanbul and Izmir require a complete source trail before they can support academic claims.</li></ul></section>
        </section>
      )}

      <footer className="research-footer"><span>Who Gets Cooled?</span><span>AI assisted urban heat governance pilot</span><span>Polen Biçer · 2026</span></footer>
    </main>
  );
}
