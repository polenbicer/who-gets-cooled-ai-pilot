"""Build a reproducible, Europe-aligned 500 m analysis grid.

Inputs are authoritative study-boundary vector files prepared as one feature per
city. The script does not download, infer or fabricate source data.

Example:
    python gis/scripts/02_build_grid.py \
        --brussels data/raw/brussels_boundary.gpkg \
        --amsterdam data/raw/amsterdam_boundary.gpkg \
        --output gis/processed/spatial_lab.gpkg
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import geopandas as gpd
from shapely.geometry import box

TARGET_CRS = "EPSG:3035"
CELL_SIZE_M = 500
FULL_CELL_AREA_M2 = CELL_SIZE_M * CELL_SIZE_M


def read_city_boundary(path: Path, city_code: str) -> gpd.GeoDataFrame:
    boundary = gpd.read_file(path)
    if boundary.empty:
        raise ValueError(f"No features found in {path}")
    if boundary.crs is None:
        raise ValueError(f"Missing CRS in {path}; assign the authoritative source CRS first")

    boundary = boundary.to_crs(TARGET_CRS)
    geometry = boundary.geometry.make_valid().union_all()
    if geometry.is_empty:
        raise ValueError(f"Boundary geometry is empty after validation: {path}")

    return gpd.GeoDataFrame(
        {"city": [city_code], "geometry": [geometry]},
        crs=TARGET_CRS,
    )


def aligned_floor(value: float) -> int:
    return math.floor(value / CELL_SIZE_M) * CELL_SIZE_M


def aligned_ceil(value: float) -> int:
    return math.ceil(value / CELL_SIZE_M) * CELL_SIZE_M


def build_city_grid(boundary: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    city = boundary.iloc[0]["city"]
    city_geometry = boundary.geometry.iloc[0]
    min_x, min_y, max_x, max_y = city_geometry.bounds

    x_start = aligned_floor(min_x)
    y_start = aligned_floor(min_y)
    x_stop = aligned_ceil(max_x)
    y_stop = aligned_ceil(max_y)

    records: list[dict] = []
    for x in range(x_start, x_stop, CELL_SIZE_M):
        for y in range(y_start, y_stop, CELL_SIZE_M):
            cell = box(x, y, x + CELL_SIZE_M, y + CELL_SIZE_M)
            intersection_area = cell.intersection(city_geometry).area
            if intersection_area <= 0:
                continue

            records.append(
                {
                    "cell_id": f"{city}_{x}_{y}",
                    "city": city,
                    "grid_x": x,
                    "grid_y": y,
                    "boundary_share": intersection_area / FULL_CELL_AREA_M2,
                    "geometry": cell,
                }
            )

    return gpd.GeoDataFrame(records, crs=TARGET_CRS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--brussels", type=Path, required=True)
    parser.add_argument("--amsterdam", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    boundaries = [
        read_city_boundary(args.brussels, "BRU"),
        read_city_boundary(args.amsterdam, "AMS"),
    ]
    grid = gpd.GeoDataFrame(
        gpd.pd.concat([build_city_grid(item) for item in boundaries], ignore_index=True),
        crs=TARGET_CRS,
    ).sort_values(["city", "grid_x", "grid_y"])

    if grid["cell_id"].duplicated().any():
        raise ValueError("Grid cell identifiers are not unique")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    grid.to_file(args.output, layer="analysis_grid_500m", driver="GPKG")
    print(f"Wrote {len(grid):,} cells to {args.output}")


if __name__ == "__main__":
    main()
