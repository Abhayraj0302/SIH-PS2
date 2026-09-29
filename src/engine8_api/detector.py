"""DetectorInterface and a strictly empty development adapter.

The adapter does not invent boxes or detections. Replace it with an Engine 4
implementation conforming to this protocol when a trained model is available.
"""
from __future__ import annotations
from typing import Protocol,Any
from engine5_confidence.schemas import Detection


class DetectorInterface(Protocol):
    mode: str
    def analyze(self, image: Any, *, image_id: str, source_dataset: str) -> list[Detection]: ...


class MockDetector:
    mode="MOCK"
    def analyze(self, image, *, image_id: str, source_dataset: str) -> list[Detection]:
        # No synthetic predictions outside tests: empty means no detector is connected.
        return []


class UnavailableDetector:
    mode="UNAVAILABLE"
    def analyze(self, image, *, image_id: str, source_dataset: str) -> list[Detection]:
        raise RuntimeError("No detector adapter is configured")
