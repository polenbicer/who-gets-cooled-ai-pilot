# Pilot methodology

## Scope

This demonstrator contains five neighbourhoods from Brussels and five from Amsterdam. The selected cases were used to test the design and communication of an AI-assisted decision sandbox; they do not constitute a representative sample of either city.

## Indicators

The pilot uses three dimensions:

- **Relative heat-exposure proxy:** impervious-surface share for Brussels and built-up-surface share for Amsterdam.
- **Age vulnerability:** the share or derived relative position of residents aged 65 and older.
- **Income vulnerability:** the inverse relative position of neighbourhood median income, so a lower income produces a higher vulnerability score.

The heat proxies differ between cities. For that reason, all 1–5 scores are calculated within each city and describe relative position rather than a directly comparable physical temperature.

## Relative scoring

For a variable where a higher raw value means greater vulnerability, the pilot uses min-max scaling:

```text
score = 1 + 4 × (value − city minimum) / (city maximum − city minimum)
```

For median income, the direction is reversed:

```text
income vulnerability = 5 − 4 × (income − city minimum) / (city maximum − city minimum)
```

The result is a relative score from 1 to 5 within the selected city sample.

## AI-assisted profiling

K-means clustering was applied to the three scaled features. The pilot used three clusters to create interpretable vulnerability profiles. After clustering, descriptive labels were assigned by examining the average feature values of each cluster.

The labels are analytical summaries, not objective identities. With only 10 observations, clustering is used as a demonstrative and discussion-generating device rather than as evidence of stable urban categories.

## Allocation scenarios

Social vulnerability is calculated as the mean of age and income vulnerability:

```text
social vulnerability = (age score + income score) / 2
```

The interface calculates the priority score under three rules:

```text
Heat-first    = 0.70 × heat + 0.30 × social vulnerability
Balanced      = 0.50 × heat + 0.50 × social vulnerability
Justice-first = 0.30 × heat + 0.70 × social vulnerability
```

These weights are not presented as objectively correct. They are deliberately explicit normative scenarios that allow users to observe how a change in public values changes the resulting ranking.

## Interpretation

The tool should be read as a structured question: *Who moves up or down the priority list when a city changes what it values?* It does not prescribe investments, estimate intervention effectiveness, or replace participatory and accountable public decision-making.

## Next validation steps

1. Expand coverage beyond the 10-neighbourhood demonstrator.
2. Replace or validate heat proxies with comparable heat-exposure measurements.
3. Test additional indicators and alternative weight combinations.
4. Report sensitivity and uncertainty in the rankings.
5. Evaluate interpretability, legitimacy, and usefulness with relevant stakeholders.
