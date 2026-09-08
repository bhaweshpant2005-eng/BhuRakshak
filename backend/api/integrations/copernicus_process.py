"""Copernicus Sentinel Hub OAuth and bounded imagery download client."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import httpx

from backend.api.config import settings
from backend.api.integrations.base import AreaOfInterest, SourceNotConfigured

SatelliteProduct = Literal["sentinel-1-grd", "sentinel-2-l2a"]


@dataclass(frozen=True)
class DownloadedRaster:
    path: Path
    media_type: str
    product: SatelliteProduct
    acquired_from: datetime
    acquired_to: datetime


class CopernicusProcessClient:
    """Download analysis-ready TIFFs through the documented Process API."""

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client

    async def _access_token(self, client: httpx.AsyncClient) -> str:
        if not settings.cdse_client_id or not settings.cdse_client_secret:
            raise SourceNotConfigured(
                "CDSE_CLIENT_ID and CDSE_CLIENT_SECRET are required for imagery download"
            )
        response = await client.post(
            settings.cdse_token_url,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.cdse_client_id,
                "client_secret": settings.cdse_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        token = response.json().get("access_token")
        if not token:
            raise RuntimeError("CDSE token response did not include an access token")
        return token

    @staticmethod
    def _evalscript(product: SatelliteProduct) -> str:
        if product == "sentinel-1-grd":
            return """//VERSION=3
function setup() {
  return {input: [{bands: [\"VV\", \"dataMask\"], units: \"LINEAR_POWER\"}], output: {bands: 2, sampleType: \"FLOAT32\"}};
}
function evaluatePixel(s) {
  return [s.dataMask ? 10 * Math.log(Math.max(s.VV, 0.000001)) / Math.LN10 : -9999, s.dataMask];
}"""
        return """//VERSION=3
function setup() {
  return {input: [{bands: [\"B04\", \"B08\", \"SCL\", \"dataMask\"]}], output: {bands: 2, sampleType: \"FLOAT32\"}};
}
function evaluatePixel(s) {
  const cloud = [0, 3, 7, 8, 9, 10, 11].includes(s.SCL);
  const valid = s.dataMask && !cloud;
  const denominator = s.B08 + s.B04;
  const ndvi = valid && denominator !== 0 ? (s.B08 - s.B04) / denominator : -9999;
  return [ndvi, valid ? 1 : 0];
}"""

    @classmethod
    def build_request(
        cls,
        product: SatelliteProduct,
        aoi: AreaOfInterest,
        start: datetime,
        end: datetime,
        width: int = 512,
        height: int = 512,
    ) -> dict:
        if width < 32 or height < 32 or width > 2500 or height > 2500:
            raise ValueError("Raster dimensions must be between 32 and 2500 pixels")
        data: dict = {
            "type": product,
            "dataFilter": {
                "timeRange": {
                    "from": start.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "to": end.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                },
                "mosaickingOrder": "mostRecent",
            },
        }
        if product == "sentinel-1-grd":
            data["dataFilter"].update({"acquisitionMode": "IW", "polarization": "DV"})
            data["processing"] = {
                "backCoeff": "GAMMA0_TERRAIN",
                "orthorectify": True,
                "demInstance": "COPERNICUS_30",
                "speckleFilter": {"type": "LEE", "windowSizeX": 5, "windowSizeY": 5},
            }
        return {
            "input": {"bounds": {"bbox": aoi.as_bbox()}, "data": [data]},
            "output": {
                "width": width,
                "height": height,
                "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}],
            },
            "evalscript": cls._evalscript(product),
        }

    async def download(
        self,
        product: SatelliteProduct,
        aoi: AreaOfInterest,
        start: datetime,
        end: datetime,
        output_path: Path,
        width: int = 512,
        height: int = 512,
    ) -> DownloadedRaster:
        if end <= start:
            raise ValueError("End time must be after start time")
        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=httpx.Timeout(120.0))
        try:
            token = await self._access_token(client)
            response = await client.post(
                settings.cdse_process_url,
                json=self.build_request(product, aoi, start, end, width, height),
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            )
            response.raise_for_status()
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(response.content)
        finally:
            if owns_client:
                await client.aclose()
        return DownloadedRaster(output_path, "image/tiff", product, start, end)
