import numpy as np
from tensorflow.keras.applications.efficientnet import preprocess_input

def preprocess(image):
    image = image.resize((224, 224))
    image = np.array(image).astype(np.float32)
    image = preprocess_input(image)
    return np.expand_dims(image, axis=0)