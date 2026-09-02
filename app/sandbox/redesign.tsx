"use client";
import { useMemo, useState } from "react";
import "./game.css";
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
};
type Choice = {
  title: string;
  body: string;
  effects: string;
  cost: number;
  apply: (s: Stats) => Stats;
};
type City = {
  country: string;
  subtitle: string;
  center: [number, number];
  zoom: number;
  districts: District[];
};
type Props = { cityData: Record<string, City>; getChoices: (turn: number) => Choice[] };
type Decision = { turn: number; title: string };
const INITIAL: Stats = {
  budget: 64,
  heat: 78,
  justice: 50,
  approval: 50,
  trust: 52,
  council: 48,
  green: 36,
  health: 55,
  lives: 0,
};
const clamp = (n: number) => Math.max(0, Math.min(100, n));
function applyTurnPressure(s: Stats, turn: number): Stats {
  const lateTerm = turn >= 7;
  return {
    ...s,
    budget: clamp(s.budget - 2),
    heat: clamp(s.heat + (lateTerm ? 2 : 1)),
    approval: clamp(s.approval - (lateTerm ? 2 : 1)),
    trust: clamp(s.trust - (turn % 3 === 0 ? 2 : 0)),
  };
}
function reaction(before: Stats, after: Stats, item: Choice) {
  if (after.justice - before.justice >= 12 && after.council < before.council)
    return "Community groups applaud. The council has formed a committee to investigate why.";
  if (after.approval - before.approval >= 8)
    return "Residents approve. The opposition has quietly renamed the same idea and announced it as their own.";
  if (before.budget - after.budget >= 15)
    return "The intervention is visible, ambitious and already giving the finance department a headache.";
  if (after.council - before.council >= 8 && after.justice < before.justice)
    return "The council meeting ended early. The neighbourhood meeting will not.";
  if (after.heat < before.heat && after.trust >= before.trust)
    return "The city is cooler and the explanation survived public scrutiny. A rare administrative event.";
  if (item.cost === 0)
    return "The budget survived untouched. Someone else will eventually send an invoice.";
  return "The policy moved the indicators. Whether it moved public opinion is less certain.";
}
function outcome(s: Stats) {
  let mayor = "The Well Meaning Chaos Mayor";
  if (s.justice >= 76 && s.trust >= 64) mayor = "The Redistribution Mayor";
  else if (s.heat <= 45 && s.approval >= 62) mayor = "The Heat Emergency Mayor";
  else if (s.council >= 70 && s.justice < 50) mayor = "The Developer Friendly Mayor";
  else if (s.budget >= 65 && s.heat > 65) mayor = "The Budget Survival Mayor";
  else if (s.approval >= 72 && s.heat > 62) mayor = "The Popular but Ineffective Mayor";
  else if (s.trust >= 66 && s.council >= 60 && s.justice >= 58) mayor = "The Consensus Mayor";
  else if (s.heat <= 58 && s.trust < 45) mayor = "The Technocrat Nobody Elected";
  let party = "The Last Minute Climate Front";
  if (s.justice >= 72) party = "Neighbourhood Justice Movement";
  else if (s.council >= 68 && s.justice < 52) party = "Green Managerial Coalition";
  else if (s.budget >= 62) party = "Budget First Independents";
  else if (s.trust >= 66 && s.approval >= 64) party = "Civic Cooling Alliance";
  else if (s.approval >= 68) party = "Municipal Pragmatists";
  let election = "You lost badly. The trees may remember you more fondly than the electorate.";
  if (s.approval >= 78 && s.trust >= 65)
    election =
      "You won the next election comfortably. Even the opposition copied your cooling plan.";
  else if (s.approval >= 66 && s.trust >= 55)
    election = "You won another term, after promising three parks and denying two budget reports.";
  else if (s.approval >= 52 && s.trust >= 42)
    election = "You survived the election by a margin small enough to blame on the weather.";
  else if (s.approval >= 38)
    election =
      "You lost the election. Your final press conference was held beside a very successful shade structure.";
  if (s.budget < 20) election += " The city may be cooler. The treasury is now mostly conceptual.";
  else if (s.council < 25)
    election += " Community groups support you. The council has muted your messages.";
  return { mayor, party, election };
}
export default function GameRedesign({ cityData, getChoices }: Props) {
  const cities = Object.keys(cityData);
  const [city, setCity] = useState(cities.includes("Brussels") ? "Brussels" : cities[0]);
  const [districtIndex, setDistrictIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [turn, setTurn] = useState(1);
  const [stats, setStats] = useState(INITIAL);
  const [selected, setSelected] = useState<number | null>(null);
  const [pending, setPending] = useState<Stats | null>(null);
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<Decision[]>([]);
  const [finished, setFinished] = useState(false);
  const cityDataNow = cityData[city];
  const district = cityDataNow.districts[districtIndex] || cityDataNow.districts[0];
  const choices = getChoices(turn);
  const result = outcome(stats);
  const shown = pending || stats;
  const map = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>html,body,#m{height:100%;margin:0}.leaflet-control-zoom{display:none}.leaflet-control-attribution{font-size:8px}.p{width:24px;height:24px;border:1px solid #111;border-radius:50%;display:grid;place-items:center;background:#1746d1;color:#fff;font:700 9px Arial;box-shadow:0 0 0 4px rgba(243,240,232,.8)}</style></head><body><div id="m"></div><script>const m=L.map('m',{dragging:false,scrollWheelZoom:false}).setView([${district.lat},${district.lng}],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap'}).addTo(m);L.marker([${district.lat},${district.lng}],{icon:L.divIcon({className:'',html:'<div class="p">${district.score}</div>',iconSize:[24,24]})}).addTo(m);</script></body></html>`,
    [district],
  );
  function choose(i: number) {
    if (selected !== null) return;
    const item = choices[i];
    const afterChoice = item.apply({ ...stats, budget: clamp(stats.budget - item.cost) });
    const after = applyTurnPressure(afterChoice, turn);
    setSelected(i);
    setPending(after);
    setResponse(reaction(stats, after, item));
    if (after.budget <= 0) {
      setStats(after);
      setHistory((h) => [...h, { turn, title: item.title }]);
      setFinished(true);
    }
  }
  function next() {
    if (selected === null || !pending) return;
    setStats(pending);
    setHistory((h) => [...h, { turn, title: choices[selected].title }]);
    if (turn === 12) {
      setFinished(true);
      return;
    }
    setTurn((t) => t + 1);
    setSelected(null);
    setPending(null);
    setResponse("");
  }
  function reset() {
    setTurn(1);
    setStats(INITIAL);
    setSelected(null);
    setPending(null);
    setResponse("");
    setHistory([]);
    setFinished(false);
    setStarted(false);
  }
  if (!started)
    return (
      <main className="sim-start">
        <a href="/">Who Gets Cooled?</a>
        <div className="sim-start-grid">
          <section>
            <p className="sim-label">Policy simulation · 12 turns</p>
            <h1>
              Take responsibility
              <br />
              for one place in heat.
            </h1>
            <p>
              Choose one city and one district. Every decision in your term will affect that same
              district, its residents and your political future.
            </p>
          </section>
          <aside>
            <label htmlFor="city">Choose your city</label>
            <select
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setDistrictIndex(0);
              }}
            >
              {cities.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <label htmlFor="district">Choose your district</label>
            <select
              id="district"
              value={districtIndex}
              onChange={(e) => setDistrictIndex(Number(e.target.value))}
            >
              {cityDataNow.districts.map((item, index) => (
                <option key={item.name} value={index}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="sim-city-preview">
              <strong>{district.name}</strong>
              <span>{city}</span>
              <small>
                Heat {district.heat} · Poverty {district.poverty} · Older residents{" "}
                {district.elderly}
              </small>
            </div>
            <button onClick={() => setStarted(true)}>
              Begin your term <span>↘</span>
            </button>
            <small>
              Your term lasts for 12 decisions, or until the public budget reaches zero. Every
              turn carries an administrative cost and political pressure.
            </small>
          </aside>
        </div>
      </main>
    );
  return (
    <main className="sim-shell">
      <header className="sim-header">
        <a href="/">Who Gets Cooled?</a>
        <span>Policy simulation</span>
        <button onClick={reset}>Exit game</button>
      </header>
      <div className="sim-game">
        <aside className="sim-dashboard">
          <div className="sim-place">
            <p className="sim-label">Your term</p>
            <h2>{district.name}</h2>
            <span>{city} · Turn {String(turn).padStart(2, "0")} of 12</span>
          </div>
          <div className="sim-stats">
            {[
              ["Budget", shown.budget],
              ["Heat pressure", shown.heat],
              ["Justice", shown.justice],
              ["Public trust", shown.trust],
              ["Approval", shown.approval],
            ].map(([l, v]) => (
              <div key={l as string}>
                <span>{l}</span>
                <strong>{v}</strong>
                <i>
                  <b style={{ width: `${v}%` }} />
                </i>
              </div>
            ))}
          </div>
          <div className="sim-map">
            <iframe title={`${district.name} map`} srcDoc={map} />
          </div>
          <div className="sim-active-place">
            <p className="sim-label">Current district</p>
            <strong>{district.name}</strong>
            <span>
              Heat {district.heat} · Poverty {district.poverty} · Older residents {district.elderly}
            </span>
          </div>
          <div className="sim-history">
            <p className="sim-label">Decision record</p>
            {history.length === 0 ? (
              <span>No decisions recorded yet.</span>
            ) : (
              history
                .slice(-3)
                .reverse()
                .map((x) => (
                  <div key={x.turn}>
                    <b>{String(x.turn).padStart(2, "0")}</b>
                    <span>{x.title}</span>
                  </div>
                ))
            )}
          </div>
        </aside>
        <section className="sim-turn">
          <div className="sim-turn-head">
            <p className="sim-label">
              Turn {String(turn).padStart(2, "0")} · {district.name}
            </p>
            <h1>{turn === 1 ? "Set your first priority." : `A decision for ${district.name}.`}</h1>
            <p>{district.description}</p>
          </div>
          <div className="sim-pressure">
            <strong>Baseline pressure this turn</strong>
            <span>Budget minus 2</span>
            <span>Heat plus {turn >= 7 ? 2 : 1}</span>
            <span>Approval minus {turn >= 7 ? 2 : 1}</span>
            {turn % 3 === 0 && <span>Trust minus 2</span>}
          </div>
          <div className="sim-choices">
            {choices.map((item, i) => (
              <button
                key={item.title}
                className={selected === i ? "selected" : ""}
                disabled={selected !== null}
                onClick={() => choose(i)}
              >
                <span className="sim-choice-number">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                  <footer>
                    <span>{item.effects}</span>
                    <b>Cost {item.cost}</b>
                  </footer>
                </div>
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="sim-reaction">
              <p className="sim-label">Immediate response</p>
              <blockquote>{response}</blockquote>
              <div>
                <span>
                  {choices[selected].effects} · Cost {choices[selected].cost} · Baseline pressure
                  applied
                </span>
                <button onClick={next}>
                  {turn === 12 ? "Complete your term" : "Continue to next turn"} <b>↘</b>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {finished && (
        <div className="sim-result-overlay">
          <article className="sim-result">
            <button className="sim-close" onClick={() => setFinished(false)}>
              Close
            </button>
            <p className="sim-label">End of term · Simulated result</p>
            <h1>{result.mayor}</h1>
            <div className="sim-party">
              <span>Your fictional political family</span>
              <strong>{result.party}</strong>
              <small>Based on simulated decisions, not your actual political identity.</small>
            </div>
            <blockquote>{result.election}</blockquote>
            <div className="sim-result-stats">
              {[
                ["Budget", stats.budget],
                ["Heat", stats.heat],
                ["Justice", stats.justice],
                ["Trust", stats.trust],
                ["Approval", stats.approval],
              ].map(([l, v]) => (
                <span key={l as string}>
                  {l}
                  <b>{v}</b>
                </span>
              ))}
            </div>
            <div className="sim-result-actions">
              <button onClick={reset}>Start a new term</button>
            </div>
            <p className="sim-disclaimer">
              This result is generated from game mechanics. It is not a political assessment,
              prediction or certificate of performance.
            </p>
          </article>
        </div>
      )}
    </main>
  );
}
