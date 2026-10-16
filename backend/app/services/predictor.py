import hashlib
import logging
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

logger = logging.getLogger("crop_guardian")


@dataclass
class Prediction:
    class_name: str | None  # None when confidence is below the threshold
    confidence: float | None  # None in demo mode, where no real score exists
    mode: str  # "model" or "demo"


class Predictor:
    """Runs the trained ResNet-18 when torch and crop_model.pt are available, otherwise demo mode."""

    def __init__(self, class_names: list[str], model_path: Path, threshold: float):
        self.class_names = class_names
        self.threshold = threshold
        self.mode = "demo"
        self._model = None
        self._load(model_path)

    def _load(self, model_path: Path) -> None:
        if not model_path.exists():
            logger.warning("Model file %s not found; running in DEMO mode.", model_path)
            return
        try:
            import torch
            import torch.nn as nn
            from torchvision import models, transforms
        except ImportError:
            logger.warning("torch/torchvision not installed (see requirements-ml.txt); running in DEMO mode.")
            return

        try:
            model = models.resnet18(weights=None)
            model.fc = nn.Linear(model.fc.in_features, len(self.class_names))
            model.load_state_dict(torch.load(model_path, map_location="cpu", weights_only=True))
            model.eval()
        except Exception:
            logger.exception("Could not load %s; running in DEMO mode.", model_path)
            return

        self._torch = torch
        self._model = model
        self._transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.mode = "model"
        logger.info("Loaded AI model from %s (%d classes).", model_path, len(self.class_names))

    def predict(self, image: Image.Image, image_bytes: bytes) -> Prediction:
        """Blocking call; the route runs it in a threadpool."""
        if self._model is None:
            # Same photo always gives the same demo answer, different photos give different ones.
            index = int.from_bytes(hashlib.sha256(image_bytes).digest()[:4], "big") % len(self.class_names)
            return Prediction(self.class_names[index], None, "demo")

        tensor = self._transform(image.convert("RGB")).unsqueeze(0)
        with self._torch.no_grad():
            probabilities = self._torch.softmax(self._model(tensor), dim=1)
            confidence, index = self._torch.max(probabilities, dim=1)
        score = round(float(confidence.item()), 4)
        if score < self.threshold:
            return Prediction(None, score, "model")
        return Prediction(self.class_names[int(index.item())], score, "model")
