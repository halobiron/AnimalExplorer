import numpy as np
from PIL import Image

def preprocess(image):
    image = image.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
    image = np.array(image).astype(np.float32)
    return np.expand_dims(image, axis=0)
