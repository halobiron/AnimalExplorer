from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from PIL import Image
import tensorflow as tf
from preprocess import preprocess
from labels import classes
import numpy as np
import base64
import io
from typing import Optional

app = FastAPI()

custom_model = tf.keras.models.load_model("animal_image_classifier.keras")


def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer
        if isinstance(layer, tf.keras.Model):
            nested = find_last_conv_layer(layer)
            if nested:
                return nested
    return None


def find_conv_layer(model, layer_name=None):
    if not layer_name:
        return find_last_conv_layer(model)

    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) and layer.name == layer_name:
            return layer
        if isinstance(layer, tf.keras.Model):
            nested = find_conv_layer(layer, layer_name)
            if nested:
                return nested
    return None


def list_conv_layers(model):
    layers = []

    def collect(current_model):
        for layer in current_model.layers:
            if isinstance(layer, tf.keras.layers.Conv2D):
                shape = getattr(layer, "output_shape", None)
                if shape is None:
                    shape = getattr(layer.output, "shape", None)
                # Skip 1x1 SE reduction layers or non-spatial conv layers
                if "_se_" in layer.name:
                    continue
                shape_tuple = tuple(shape) if shape is not None else ()
                if len(shape_tuple) == 4 and shape_tuple[1] == 1 and shape_tuple[2] == 1:
                    continue
                layers.append({
                    "name": layer.name,
                    "shape": str(shape),
                })
            elif isinstance(layer, tf.keras.Model):
                collect(layer)

    collect(model)
    return layers


def find_backbone_layer(model, layer_name=None):
    for index, layer in enumerate(model.layers):
        if isinstance(layer, tf.keras.Model) and find_conv_layer(layer, layer_name):
            return index, layer
    return None, None


def colorize_heatmap(heatmap):
    heatmap = np.uint8(255 * heatmap)
    colors = np.zeros((*heatmap.shape, 3), dtype=np.uint8)

    x = heatmap.astype(np.float32) / 255.0
    colors[..., 0] = np.uint8(255 * np.clip(1.5 - np.abs(4 * x - 3), 0, 1))
    colors[..., 1] = np.uint8(255 * np.clip(1.5 - np.abs(4 * x - 2), 0, 1))
    colors[..., 2] = np.uint8(255 * np.clip(1.5 - np.abs(4 * x - 1), 0, 1))
    return colors


def call_layer(layer, inputs):
    try:
        return layer(inputs, training=False)
    except TypeError:
        return layer(inputs)


def unwrap_single_output(output):
    if isinstance(output, (list, tuple)) and len(output) == 1:
        return output[0]
    return output


def build_direct_grad_model(model, image_batch, class_index, layer_name=None):
    conv_layer = find_conv_layer(model, layer_name)
    if not conv_layer:
        return None, None, None

    grad_model = tf.keras.models.Model(
        model.inputs,
        [conv_layer.output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(image_batch)
        class_channel = predictions[:, class_index]

    return conv_layer, conv_outputs, tape.gradient(class_channel, conv_outputs)


def build_nested_backbone_grad_model(model, image_batch, class_index, layer_name=None):
    backbone_index, backbone = find_backbone_layer(model, layer_name)
    if backbone is None:
        return None, None, None

    conv_layer = find_conv_layer(backbone, layer_name)
    backbone_grad_model = tf.keras.models.Model(
        backbone.inputs,
        [conv_layer.output, backbone.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, x = backbone_grad_model(image_batch)
        x = unwrap_single_output(x)
        for layer in model.layers[backbone_index + 1:]:
            x = call_layer(layer, x)
        predictions = x
        class_channel = predictions[:, class_index]

    return conv_layer, conv_outputs, tape.gradient(class_channel, conv_outputs)


def build_gradcam(model, image_batch, image_pil, class_index, layer_name=None, alpha=0.42):
    try:
        conv_layer, conv_outputs, grads = build_direct_grad_model(model, image_batch, class_index, layer_name)
    except Exception:
        conv_layer, conv_outputs, grads = build_nested_backbone_grad_model(model, image_batch, class_index, layer_name)

    if conv_layer is None or grads is None:
        # Fallback to default last conv layer if specific layer failed
        if layer_name is not None:
            try:
                return build_gradcam(model, image_batch, image_pil, class_index, None, alpha)
            except Exception:
                pass
        return None

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + tf.keras.backend.epsilon())
    heatmap = np.squeeze(heatmap.numpy())
    if heatmap.ndim != 2:
        if heatmap.ndim == 0:
            heatmap = np.ones((7, 7), dtype=np.float32) * float(heatmap)
        elif heatmap.ndim == 1:
            heatmap = np.tile(heatmap[:, None], (1, len(heatmap)))
        else:
            raise ValueError(f"Grad-CAM heatmap must be 2D, got shape {heatmap.shape}")

    original = image_pil.convert("RGB").resize((448, 448))
    heatmap_image = (
        Image.fromarray(colorize_heatmap(heatmap))
        .resize(original.size, Image.Resampling.BILINEAR)
        .convert("RGB")
    )

    overlay = Image.blend(original, heatmap_image, alpha)
    buffer = io.BytesIO()
    overlay.save(buffer, format="JPEG", quality=90)

    return {
        "image": "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8"),
        "layer": conv_layer.name,
        "layers": list_conv_layers(model),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...), gradcam_layer: Optional[str] = Form(default=None)):
    image_pil = Image.open(file.file).convert("RGB")

    image = preprocess(image_pil)
    preds = custom_model.predict(image)
    pred = int(preds.argmax(axis=1)[0])
    custom_confidence = float(preds[0][pred])

    # extra debug info to diagnose repeating predictions
    top_idx = preds[0].argsort()[-5:][::-1]
    top_scores = preds[0][top_idx]
    top_classes = [classes[i] for i in top_idx]

    print(f"DEBUG: Predictions shape: {preds.shape}")
    print(f"DEBUG: preds dtype: {preds.dtype}, min: {preds.min()}, max: {preds.max()}, sum: {preds.sum()}")
    print(f"DEBUG: Top 5 indices: {top_idx}")
    print(f"DEBUG: Top 5 classes: {top_classes}")
    print(f"DEBUG: Top 5 scores: {top_scores}")
    print(f"DEBUG: Custom model predicted: {classes[pred]} with confidence: {custom_confidence:.2%}")

    top5 = [{"class": top_classes[i], "score": float(top_scores[i])} for i in range(len(top_classes))]

    try:
        gradcam = build_gradcam(custom_model, image, image_pil, pred, gradcam_layer)
    except Exception as exc:
        print(f"DEBUG: Grad-CAM failed: {exc}")
        gradcam = None

    return {
        "class": classes[pred],
        "confidence": custom_confidence,
        "top5": top5,
        "gradcam": gradcam,
        "gradcam_class_index": pred,
        "cnn_demo": {
            "input_shape": list(image.shape[1:]),
            "class_count": len(classes),
            "preprocessing": ["RGB", "Resize 224x224", "float32", "Rescaling 1/255 trong CNN"],
            "conv_layers": list_conv_layers(custom_model),
        },
    }


@app.post("/gradcam")
async def gradcam(
    file: UploadFile = File(...),
    class_index: int = Form(...),
    gradcam_layer: Optional[str] = Form(default=None),
):
    image_pil = Image.open(file.file).convert("RGB")
    image_batch = preprocess(image_pil)
    model = custom_model

    output_shape = model.output_shape[-1]
    if class_index < 0 or class_index >= output_shape:
        raise HTTPException(status_code=400, detail="class_index is out of range for the custom model")

    try:
        generated = build_gradcam(model, image_batch, image_pil, class_index, gradcam_layer)
    except Exception as exc:
        print(f"DEBUG: Grad-CAM endpoint failed: {exc}")
        generated = None

    if generated is None:
        # Fallback to default conv layer before raising error
        try:
            generated = build_gradcam(model, image_batch, image_pil, class_index, None)
        except Exception:
            generated = None

    if generated is None:
        raise HTTPException(status_code=400, detail="Could not generate Grad-CAM for selected layer")

    return {"gradcam": generated}
