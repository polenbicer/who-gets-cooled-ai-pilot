# Spatial Sensitivity Lab — GIS analysis specification

## Purpose

The GIS extension expands the current ten-neighbourhood demonstrator to the full
urban territories of the Brussels-Capital Region and the Municipality of Amsterdam.

It asks:

> Which places remain cooling priorities, and which places move up or down, when
> the spatial unit, indicator set, normalisation method, or policy weights change?

The analysis is a sensitivity and accountability exercise. It does not predict
where a city must invest and it does not treat an ML output as a public decision.

## Analysis geography

- **Common projection:** ETRS89 / LAEA Europe (EPSG:3035).
- **Primary analytical unit:** aligned 500 m square grid.
- **Study boundaries:** Brussels-Capital Region and Municipality of Amsterdam.
- **Inclusion rule:** retain cells intersecting the study boundary that contain
  residential population or a minimum built-up share.
- **Water treatment:** calculate water share and exclude predominantly water cells
  from rankings while preserving them for cartographic context.
- **Reason for a common grid:** municipal neighbourhood units differ in size,
  population and institutional meaning, so direct neighbourhood-to-neighbourhood
  comparison can produce an administrative-boundary artefact.

The 500 m choice is provisional until the source-resolution audit is complete.
No source should be presented at a finer effective resolution than its published
data support.

## Two evidence layers

### A. Harmonised core

Used for cross-city comparison. Each variable must use the same definition,
reference period and processing method in both cities where possible.

| Field | Meaning | Direction |
|---|---|---|
| heat_anomaly | Summer surface-heat proxy relative to the city's reference distribution | Higher = more exposed |
| impervious_share | Share of grid cell covered by impervious surface | Higher = more exposed |
| tree_cover_share | Share of grid cell covered by tree canopy | Lower = more vulnerable |
| age_65_share | Share of residents aged 65 and older | Higher = more vulnerable |
| population | Residential population used for exposure and inclusion checks | Context |
| cool_access_m | Network or Euclidean distance to selected public cooling assets | Higher = less access |

Candidate common sources include Copernicus Land Monitoring Service products and
Eurostat/GISCO population grids. Exact product versions, dates, licences and
effective resolutions must be recorded before analysis.

### B. Local context

Used for within-city interpretation, not unqualified absolute comparison.

| Field | Meaning | Comparability warning |
|---|---|---|
| income_vulnerability | Locally defined low-income or median-income vulnerability | Definitions and years may differ |
| local_heat_measure | Municipal heat indicator where available | Measurement methods may differ |
| municipal_area | Local statistical neighbourhood identifier | Boundaries are not equivalent across cities |
| local_cooling_asset | Locally documented park, water, library or cooling facility | Classification may differ |

The interface must let readers distinguish the harmonised model from the
local-context model.

## Derived indicators

All transformations must retain the raw field, source, year, units and formula.

1. Calculate zonal statistics for raster variables.
2. Calculate land-cover shares from intersected polygons or classified rasters.
3. Join population and age attributes using area-weighted or population-weighted
   allocation, explicitly documenting which method is used.
4. Calculate cooling-access distance using a reproducible asset definition.
5. Create both:
   - within-city percentile scores; and
   - pooled cross-city scores for genuinely harmonised variables.
6. Record missingness and source resolution per cell.
7. Do not silently impute unavailable values.

## Policy scenarios

The current transparent scenarios are retained:

- Heat-first: 70% heat exposure, 30% social vulnerability.
- Balanced: 50% heat exposure, 50% social vulnerability.
- Justice-first: 30% heat exposure, 70% social vulnerability.

The GIS extension adds sensitivity outputs:

- **rank range:** highest rank minus lowest rank across scenarios;
- **rank standard deviation:** volatility across tested specifications;
- **priority frequency:** share of specifications in which a cell enters the top
  priority group;
- **consensus class:** robust priority, policy-sensitive, data-sensitive, or low
  consensus.

Top-priority thresholds must be declared in the methodology and tested rather
than chosen to manufacture visually dramatic contrast.

## Machine-learning role

ML is used for exploratory profiling after the full grid dataset exists.

Initial methods:

1. PCA on documented, scaled harmonised indicators.
2. K-means and Gaussian-mixture clustering as competing profile models.
3. Cluster-stability checks across random seeds and plausible cluster counts.
4. Optional spatially constrained clustering if ordinary clusters are excessively
   fragmented.

No supervised prediction will be presented until a defensible observed target
and validation design exist. Cluster labels are interpretive summaries assigned
after inspecting cluster characteristics.

## Planned web outputs

1. **Cooling need:** map the three explicit policy scenarios.
2. **Policy disagreement:** map cells whose ranks change most across weights.
3. **Data sensitivity:** compare harmonised-core and local-context results.
4. **Stable priorities:** show cells that remain high priority across reasonable
   specifications.
5. **Cell evidence panel:** show raw values, transformed scores, source years and
   the exact reason a selected cell received its result.

The web map will display exported GeoJSON/vector tiles produced from the GIS
workflow; it will not claim that QGIS or the ML model is running in the browser.

## Reproducible project structure

```text
gis/
  qgis/
    spatial-sensitivity-lab.qgz
  scripts/
    01_prepare_boundaries.py
    02_build_grid.py
    03_derive_environment.py
    04_join_population.py
    05_score_scenarios.py
    06_profile_clusters.py
    07_export_web.py
  raw/
    README.md
  interim/
  processed/
    spatial_lab.gpkg
    web_cells.geojson
  metadata/
    source_register.csv
    field_dictionary.csv
```

Raw source files should not be committed when licensing, size or redistribution
terms prohibit it. The source register must preserve download URL, publisher,
version, reference date, licence, spatial resolution, CRS and retrieval date.

## First implementation sequence

1. Verify authoritative city boundaries and the exact study-area definitions.
2. Complete the source-resolution and licensing register.
3. Build and validate the aligned 500 m grid.
4. Produce a harmonised environmental prototype using one common land-cover
   product.
5. Add population and age.
6. Audit income compatibility before adding it to cross-city results.
7. Calculate scenario and sensitivity fields.
8. Test exploratory clustering only after data-quality checks.
9. Export a reduced web layer and build the interactive section.
