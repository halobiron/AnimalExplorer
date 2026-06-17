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

# Load EfficientNetV2B1 with ImageNet as fallback
fallback_model = tf.keras.applications.EfficientNetV2B1(weights="imagenet")
decode_imagenet = tf.keras.applications.efficientnet_v2.decode_predictions


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
                    shape = getattr(layer.output, "shape", "")
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
    except ValueError:
        conv_layer, conv_outputs, grads = build_nested_backbone_grad_model(model, image_batch, class_index, layer_name)

    if conv_layer is None or grads is None:
        return None

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + tf.keras.backend.epsilon())
    heatmap = np.squeeze(heatmap.numpy())
    if heatmap.ndim != 2:
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

    image_efficientnet = np.array(image_pil.resize((240, 240)))
    image_efficientnet = tf.keras.applications.efficientnet_v2.preprocess_input(image_efficientnet)
    image_efficientnet = np.expand_dims(image_efficientnet, axis=0)

    # Predict with fallback
    fallback_preds = fallback_model.predict(image_efficientnet, verbose=0)
    fallback_decoded = decode_imagenet(fallback_preds, top=1)[0]

    fallback_class = fallback_decoded[0][1]  # Get class name
    fallback_confidence = float(fallback_decoded[0][2])

    print(f"DEBUG: Fallback model predicted: {fallback_class} with confidence: {fallback_confidence:.2%}")

    if fallback_confidence > 0.90:
        use_fallback = True
        decision_reason = "fallback_very_confident"
    else:
        use_fallback = fallback_confidence > custom_confidence
        decision_reason = "compare_confidence"

    try:
        if use_fallback:
            gradcam = build_gradcam(
                fallback_model,
                image_efficientnet,
                image_pil,
                int(fallback_preds.argmax(axis=1)[0]),
                gradcam_layer,
            )
        else:
            gradcam = build_gradcam(custom_model, image, image_pil, pred, gradcam_layer)
    except Exception as exc:
        print(f"DEBUG: Grad-CAM failed: {exc}")
        gradcam = None

    if use_fallback:
        gradcam_class_index = int(fallback_preds.argmax(axis=1)[0])
        print(f"DECISION: Using FALLBACK) ({decision_reason})")
        return {
            "class": fallback_class,
            "confidence": fallback_confidence,
            "top5": top5,
            "gradcam": gradcam,
            "model_used": "fallback",
            "gradcam_class_index": gradcam_class_index,
            "fallback_used": True,
            "fallback_class": fallback_class,
            "fallback_confidence": fallback_confidence,
            "custom_class": classes[pred],
            "custom_confidence": custom_confidence
        }
    else:
        print(f"DECISION: Using CUSTOM ({custom_confidence:.2%} >= {fallback_confidence:.2%})")
        return {
            "class": classes[pred],
            "confidence": custom_confidence,
            "top5": top5,
            "gradcam": gradcam,
            "model_used": "custom",
            "gradcam_class_index": pred,
            "fallback_used": False,
            "fallback_class": fallback_class,
            "fallback_confidence": fallback_confidence,
            "custom_class": classes[pred],
            "custom_confidence": custom_confidence
        }


@app.post("/gradcam")
async def gradcam(
    file: UploadFile = File(...),
    model_used: str = Form(...),
    class_index: int = Form(...),
    gradcam_layer: Optional[str] = Form(default=None),
):
    image_pil = Image.open(file.file).convert("RGB")
    selected_model = model_used.lower()

    if selected_model == "fallback":
        image_batch = np.array(image_pil.resize((240, 240)))
        image_batch = tf.keras.applications.efficientnet_v2.preprocess_input(image_batch)
        image_batch = np.expand_dims(image_batch, axis=0)
        model = fallback_model
    elif selected_model == "custom":
        image_batch = preprocess(image_pil)
        model = custom_model
    else:
        raise HTTPException(status_code=400, detail="model_used must be 'custom' or 'fallback'")

    output_shape = model.output_shape[-1]
    if class_index < 0 or class_index >= output_shape:
        raise HTTPException(status_code=400, detail="class_index is out of range for selected model")

    try:
        generated = build_gradcam(model, image_batch, image_pil, class_index, gradcam_layer)
    except Exception as exc:
        print(f"DEBUG: Grad-CAM endpoint failed: {exc}")
        generated = None

    if generated is None:
        raise HTTPException(status_code=400, detail="Could not generate Grad-CAM for selected layer")

    return {"gradcam": generated}
