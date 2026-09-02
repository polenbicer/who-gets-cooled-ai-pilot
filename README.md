# Who Gets Cooled?

**An AI assisted urban heat governance and environmental justice pilot.**

[Open the live interactive pilot](https://who-gets-cooled-pilot.bercestesanem-il.chatgpt.site)

Developed by **Polen Bicer** as a research prototype exploring how data and policy-value choices can change which neighbourhoods are prioritised for urban cooling.

## Research purpose

Urban heat adaptation is not only a technical problem. When public resources are limited, cities must decide which neighbourhoods receive cooling interventions first. Those decisions depend on what is measured, how indicators are made comparable, and which public values are prioritised.

This pilot makes those choices visible. It uses derived neighbourhood-level scores for heat exposure, age vulnerability, and income vulnerability across five neighbourhoods in Brussels and five in Amsterdam. It then allows users to compare three transparent allocation rules:

- **Heat-first:** 70% heat exposure and 30% social vulnerability.
- **Balanced:** 50% heat exposure and 50% social vulnerability.
- **Justice-first:** 30% heat exposure and 70% social vulnerability.

The tool is a decision sandbox, not an automated decision-maker. Its purpose is to support scrutiny and discussion about environmental justice, transparency, and public-sector responsibility.

## Where AI enters

The pilot analysis used K-means clustering to group neighbourhoods with similar combinations of heat, age, and income vulnerability. The web application displays those precomputed profiles and lets the user explore how explicit policy weights change the priority ranking.

It is important to separate the two stages:

1. **AI-assisted profiling:** K-means identifies similarities in the pilot dataset.
2. **Human-defined allocation:** The three ranking rules encode explicit policy choices.

AI can expose patterns, but it cannot decide what justice should mean. Indicator selection, scoring, weighting, interpretation, and the final public decision remain human responsibilities.

## Pilot decision chain

```text
Open municipal indicators
        ↓
Human selection of indicators and proxies
        ↓
Within city conversion to relative 1 to 5 scores
        ↓
K-means neighbourhood profiling
        ↓
Human-selected policy rule
        ↓
Neighbourhood priority ranking
        ↓
Public scrutiny and human judgment
```

## Data

The research dataset contains 10 documented demonstrative observations, five in Brussels and five in Amsterdam. Their derived scores are available in [`data/pilot_scores.csv`](data/pilot_scores.csv).

The interface also contains prototype extensions for Istanbul and Izmir. Their complete source trail is not present in this repository. The interface labels them accordingly, and their values should not be cited as validated research findings.

The underlying pilot indicators were assembled from official municipal and urban research sources, including Brussels' *Monitoring des Quartiers* and Amsterdam's *Onderzoek en Statistiek*. The cities' heat proxies are not identical: the Brussels pilot uses impervious-surface share, while the Amsterdam pilot uses built-up-surface share. Values are therefore standardised within each city and must not be interpreted as directly comparable temperatures.

See [`docs/methodology.md`](docs/methodology.md) for the scoring formula, assumptions, and limitations.

## Current limitations

- Ten neighbourhoods are sufficient for a demonstrator, but not for robust statistical generalisation.
- The heat indicators are proxies rather than directly measured neighbourhood temperatures.
- The source years differ across variables and cities.
- A relative 1 to 5 score describes position within the selected city sample; it is not an absolute risk measure.
- Cluster labels are interpretive descriptions of patterns, not natural or permanent categories.
- The interface currently embeds the precomputed pilot profiles; it does not retrain the clustering model in the browser.

## Research direction

The pilot can be developed into a comparative thesis on how data selection and policy values shape AI-assisted urban heat prioritisation in Brussels and Amsterdam. A fuller study would expand neighbourhood coverage, test the sensitivity of rankings to alternative indicators and weights, examine municipal AI and heat-governance documents, and evaluate the tool with public officials or urban-policy stakeholders.

## Run locally

Requirements: Node.js 22.13 or later and pnpm.

```bash
pnpm install
pnpm dev
```

Then open the local address shown in the terminal.

To create a production build:

```bash
pnpm build
```

## Technology

- React and TypeScript
- vinext and Vite
- Recharts
- Tailwind CSS and shadcn-style UI components

## Author

**Polen Bicer**  
Research interests: responsible AI, public sector data, urban governance, environmental justice, and algorithmic legitimacy.

## Status

Research pilot under development. The application and its outputs should not be used as an operational municipal allocation system.
