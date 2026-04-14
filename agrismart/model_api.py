from flask import Flask, request, jsonify
from flask_cors import CORS
import keras
import numpy as np
from PIL import Image
import base64, io, os

app = Flask(__name__)
CORS(app)

# Load model with Keras 3 (compatible with patched model)
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_v2.h5')
print(f"Loading model from: {MODEL_PATH}")
model = keras.models.load_model(MODEL_PATH, compile=False)
print(f"✅ Model loaded — input: {model.input_shape}, output: {model.output_shape}")

CLASS_NAMES = [
    'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Tomato_Early_blight',
    'Tomato_Late_blight',
    'Tomato__Target_Spot',
    'Tomato__Tomato_YellowLeaf__Curl_Virus',
    'Tomato__Tomato_mosaic_virus',
    'Tomato_Bacterial_spot',
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot',
    'Tomato_Spider_mites Two-spotted_spider_mite',
    'Tomato_healthy',
]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        img_data = base64.b64decode(request.json['image'])
        img = Image.open(io.BytesIO(img_data)).convert('RGB')

        # Match training pipeline exactly:
        #   1. BILINEAR interpolation (Keras ImageDataGenerator default)
        #   2. rescale=1/255 → [0, 1] range
        img = img.resize((224, 224), Image.BILINEAR)
        arr = np.array(img, dtype=np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)

        pred = model.predict(arr)[0]
        return jsonify({
            'disease': CLASS_NAMES[np.argmax(pred)],
            'confidence': int(float(np.max(pred)) * 100),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'MobileNetV2', 'classes': len(CLASS_NAMES)})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)