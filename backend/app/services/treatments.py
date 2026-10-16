import json
from pathlib import Path

UNRECOGNIZED = {
    "disease_en": "Unrecognized Image",
    "disease_ur": "تصویر پہچانی نہیں جا سکی",
    "recommendation_en": {
        "pesticide": "Could not confidently identify a plant disease.",
        "dosage": "Take a clear, close-up photo of a single leaf in daylight and try again.",
    },
    "recommendation_ur": {
        "pesticide": "پودے کی بیماری کی درست پہچان نہیں ہو سکی۔",
        "dosage": "دن کی روشنی میں ایک پتے کی صاف اور قریب سے تصویر لے کر دوبارہ کوشش کریں۔",
    },
}


class TreatmentBook:
    """Bilingual disease names and treatments, keyed by PlantVillage class name."""

    def __init__(self, path: Path):
        self._data: dict[str, dict] = json.loads(path.read_text(encoding="utf-8"))
        # Same order torchvision's ImageFolder used when the model was trained.
        self.class_names: list[str] = sorted(self._data)

    def lookup(self, class_name: str) -> dict:
        entry = self._data[class_name]
        condition = class_name.partition("___")[2]
        return {
            "class_id": class_name,
            "crop": entry["name_en"].split(" - ")[0],
            "is_healthy": condition.lower() == "healthy",
            "disease_en": entry["name_en"],
            "disease_ur": entry["name_ur"],
            "recommendation_en": {"pesticide": entry["pesticide"], "dosage": entry["dosage"]},
            "recommendation_ur": {"pesticide": entry["pesticide_ur"], "dosage": entry["dosage_ur"]},
        }
