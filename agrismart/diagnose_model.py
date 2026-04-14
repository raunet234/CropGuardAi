"""
diagnose_model.py — Test model with different preprocessing to find the correct one.

Problem: Model shows ~47% confidence when it should show 90%+.
Root cause: Preprocessing mismatch between training and inference.

MobileNetV2 standard preprocess_input maps [0,255] → [-1,1] (not [0,1]).
If the model was trained using tf.keras.applications.mobilenet_v2.preprocess_input,
then dividing by 255.0 (giving [0,1]) is WRONG and will halve confidence.
"""
import keras
import numpy as np
from PIL import Image
import os, sys, glob, json

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_v2.h5')

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


def preprocess_mobilenetv2(img_array):
    """MobileNetV2 standard: [0,255] → [-1,1]"""
    return (img_array / 127.5) - 1.0


def preprocess_rescale(img_array):
    """Simple rescale: [0,255] → [0,1]"""
    return img_array / 255.0


def preprocess_raw(img_array):
    """No preprocessing: raw [0,255]"""
    return img_array.astype(np.float32)


def load_test_image(path):
    """Load and resize image to 224x224."""
    img = Image.open(path).convert('RGB').resize((224, 224))
    return np.array(img, dtype=np.float32)


def main():
    print("=" * 70)
    print("  MODEL PREPROCESSING DIAGNOSTIC")
    print("=" * 70)

    # Load model
    print(f"\nLoading model: {MODEL_PATH}")
    model = keras.models.load_model(MODEL_PATH, compile=False)
    print(f"  Input shape : {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")
    print(f"  Layers      : {len(model.layers)}")

    # Check model's internal preprocessing layers
    print("\n--- Model Layer Summary ---")
    for i, layer in enumerate(model.layers):
        print(f"  [{i}] {layer.__class__.__name__:30s} → {layer.name}")
        # Check if there's a Rescaling layer inside
        if hasattr(layer, 'layers'):
            for j, sub in enumerate(layer.layers[:5]):
                print(f"       [{j}] {sub.__class__.__name__:26s} → {sub.name}")
            if len(layer.layers) > 5:
                print(f"       ... ({len(layer.layers)} total sublayers)")

    # Find test images
    test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'screenshots')
    test_images = []
    if os.path.isdir(test_dir):
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
            test_images.extend(glob.glob(os.path.join(test_dir, ext)))
            test_images.extend(glob.glob(os.path.join(test_dir, '**', ext), recursive=True))

    # Also check current dir
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
        test_images.extend(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), ext)))

    if not test_images:
        # Create a synthetic test with random noise to test preprocessing behavior
        print("\n⚠️  No test images found. Using synthetic test image.")
        test_images = ['__synthetic__']

    preprocessing_methods = {
        'MobileNetV2 [-1,1]': preprocess_mobilenetv2,
        'Rescale [0,1]': preprocess_rescale,
        'Raw [0,255]': preprocess_raw,
    }

    results = {}

    for img_path in test_images[:3]:  # Test up to 3 images
        if img_path == '__synthetic__':
            # Use a random-ish image for testing (simulates a green leaf-like image)
            np.random.seed(42)
            img_array = np.random.randint(30, 200, (224, 224, 3)).astype(np.float32)
            img_name = "synthetic_noise"
        else:
            img_array = load_test_image(img_path)
            img_name = os.path.basename(img_path)

        print(f"\n{'─' * 70}")
        print(f"  Testing image: {img_name}")
        print(f"  Raw pixel range: [{img_array.min():.0f}, {img_array.max():.0f}]")
        print(f"{'─' * 70}")

        for method_name, preprocess_fn in preprocessing_methods.items():
            processed = preprocess_fn(img_array.copy())
            batch = np.expand_dims(processed, axis=0)
            pred = model.predict(batch, verbose=0)[0]

            top_idx = np.argmax(pred)
            top_conf = float(np.max(pred)) * 100

            # Get top 3
            top3_idx = np.argsort(pred)[-3:][::-1]
            top3 = [(CLASS_NAMES[i], float(pred[i]) * 100) for i in top3_idx]

            print(f"\n  🔧 Preprocessing: {method_name}")
            print(f"     Input range : [{processed.min():.2f}, {processed.max():.2f}]")
            print(f"     ┌─────────────────────────────────────────────────────")
            for rank, (name, conf) in enumerate(top3, 1):
                bar = '█' * int(conf / 2) + '░' * (50 - int(conf / 2))
                marker = " ← TOP" if rank == 1 else ""
                print(f"     │ #{rank}  {conf:5.1f}%  {bar}  {name}{marker}")
            print(f"     └─────────────────────────────────────────────────────")

            results.setdefault(img_name, {})[method_name] = {
                'top_class': CLASS_NAMES[top_idx],
                'confidence': round(top_conf, 1),
                'top3': top3,
            }

    # Summary & Recommendation
    print(f"\n{'=' * 70}")
    print("  RECOMMENDATION")
    print(f"{'=' * 70}")

    # Determine which preprocessing gives highest confidence
    best_method = None
    best_conf = 0
    for img_name, methods in results.items():
        for method_name, data in methods.items():
            if data['confidence'] > best_conf:
                best_conf = data['confidence']
                best_method = method_name

    if best_method:
        print(f"\n  ✅ BEST PREPROCESSING: {best_method}")
        print(f"     Highest confidence: {best_conf:.1f}%")

        if 'MobileNetV2' in best_method:
            print(f"\n  📝 FIX: Change model_api.py line:")
            print(f"     OLD: arr = np.expand_dims(np.array(img) / 255.0, axis=0)")
            print(f"     NEW: arr = np.expand_dims((np.array(img) / 127.5) - 1.0, axis=0)")
        elif 'Rescale' in best_method:
            print(f"\n  📝 Current preprocessing (/255.0) is correct.")
            print(f"     Low confidence may be due to image quality or model training issue.")
        elif 'Raw' in best_method:
            print(f"\n  📝 FIX: Remove normalization. Use raw pixel values.")
    else:
        print("\n  ⚠️  Could not determine best preprocessing — no test images available.")

    # Save results to file
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'diagnosis_results.json')
    with open(output_path, 'w') as f:
        json.dump({
            'model_info': {
                'path': MODEL_PATH,
                'input_shape': str(model.input_shape),
                'output_shape': str(model.output_shape),
                'num_classes': len(CLASS_NAMES),
            },
            'recommendation': best_method,
            'results': {k: {mk: {'top_class': mv['top_class'], 'confidence': mv['confidence']}
                            for mk, mv in v.items()} for k, v in results.items()},
        }, f, indent=2)
    print(f"\n  📄 Full results saved to: {output_path}")


if __name__ == '__main__':
    main()
