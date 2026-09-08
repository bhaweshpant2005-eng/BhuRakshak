"""Command-line ingestion entry points for scheduled and offline workers."""
from __future__ import annotations

import argparse
import asyncio
from datetime import datetime
from pathlib import Path

from backend.api.database import close_database, initialize_database
from backend.api.integrations.base import AreaOfInterest
from backend.api.integrations.copernicus_process import CopernicusProcessClient
from backend.api.integrations.file_import import FileImportAdapter, IMPORT_SOURCES, load_metadata
from backend.api.services.ingestion import IngestionService


def parse_aoi(value: str) -> AreaOfInterest:
    try:
        west, south, east, north = (float(item) for item in value.split(","))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("AOI must be west,south,east,north") from exc
    if west >= east or south >= north:
        raise argparse.ArgumentTypeError("AOI bounds must have west < east and south < north")
    return AreaOfInterest(west, south, east, north)


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="BhuRakshak data ingestion worker")
    commands = root.add_subparsers(dest="command", required=True)

    file_command = commands.add_parser("import-file", help="Register an authorized or public dataset file")
    file_command.add_argument("--source", required=True, choices=sorted(IMPORT_SOURCES))
    file_command.add_argument("--path", required=True, type=Path)
    file_command.add_argument("--metadata", type=Path)
    file_command.add_argument("--aoi", required=True, type=parse_aoi)

    download = commands.add_parser("download-sentinel", help="Download a bounded analysis raster through CDSE")
    download.add_argument("--product", required=True, choices=["sentinel-1-grd", "sentinel-2-l2a"])
    download.add_argument("--aoi", required=True, type=parse_aoi)
    download.add_argument("--start", required=True, type=datetime.fromisoformat)
    download.add_argument("--end", required=True, type=datetime.fromisoformat)
    download.add_argument("--output", required=True, type=Path)
    download.add_argument("--width", type=int, default=512)
    download.add_argument("--height", type=int, default=512)
    return root


async def run(args: argparse.Namespace) -> None:
    await initialize_database()
    try:
        if args.command == "import-file":
            result = await IngestionService().run(
                FileImportAdapter(args.source, args.path, load_metadata(args.metadata)),
                args.aoi,
            )
            print(result)
            return
        raster = await CopernicusProcessClient().download(
            args.product,
            args.aoi,
            args.start,
            args.end,
            args.output,
            args.width,
            args.height,
        )
        print({"path": str(raster.path), "product": raster.product, "media_type": raster.media_type})
    finally:
        await close_database()


def main() -> None:
    asyncio.run(run(parser().parse_args()))


if __name__ == "__main__":
    main()
