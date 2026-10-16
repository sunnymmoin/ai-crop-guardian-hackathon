"""Checks the real-model path: a ResNet-18 state dict saved the way train.py saves crop_model.pt."""

import pytest
from PIL import Image

from app.config import BACKEND_DIR
from app.services.predictor import Predictor
from app.services.treatments import TreatmentBook

torch = pytest.importorskip("torch")
models = pytest.importorskip("torchvision.models")


@pytest.fixture(scope="module")
def class_names():
    return TreatmentBook(BACKEND_DIR / "disease_treatments.json").class_names


@pytest.fixture(scope="module")
def model_file(tmp_path_factory, class_names):
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))
    path = tmp_path_factory.mktemp("model") / "crop_model.pt"
    torch.save(model.state_dict(), path)
    return path


def test_loads_trained_weights_and_predicts(model_file, class_names):
    predictor = Predictor(class_names, model_file, threshold=0.0)
    assert predictor.mode == "model"
    prediction = predictor.predict(Image.new("RGB", (300, 300), (40, 160, 60)), b"unused")
    assert prediction.mode == "model"
    assert prediction.class_name in class_names
    assert 0.0 < prediction.confidence <= 1.0


def test_low_confidence_is_unrecognized(model_file, class_names):
    # Untrained weights spread probability over 38 classes, far below a 0.99 threshold.
    predictor = Predictor(class_names, model_file, threshold=0.99)
    prediction = predictor.predict(Image.new("RGB", (300, 300), (200, 200, 200)), b"unused")
    assert prediction.class_name is None
    assert prediction.confidence is not None


def test_wrong_shape_model_falls_back_to_demo(tmp_path, class_names):
    model = models.resnet18(weights=None)  # 1000 outputs, not 38
    path = tmp_path / "wrong.pt"
    torch.save(model.state_dict(), path)
    assert Predictor(class_names, path, threshold=0.5).mode == "demo"
