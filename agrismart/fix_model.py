"""
Fix model_v2.h5 saved with Keras 3.13.2 to be compatible with Keras 3.10.0.

The model was saved with a newer Keras that adds 'quantization_config' to Dense
layers and 'optional' to InputLayer, plus uses 'batch_shape' instead of
'batch_input_shape'. This script patches the H5 config JSON in-place.
"""
import h5py
import json
import shutil
import sys


def patch_layer_config(layer):
    """Recursively patch layer configs to remove incompatible fields."""
    cfg = layer.get('config', {})

    class_name = layer.get('class_name', '')

    # InputLayer: remove 'optional', rename 'batch_shape' -> 'batch_input_shape'
    if class_name == 'InputLayer':
        cfg.pop('optional', None)
        cfg.pop('ragged', None)
        if 'batch_shape' in cfg and 'batch_input_shape' not in cfg:
            cfg['batch_input_shape'] = cfg.pop('batch_shape')

    # Dense: remove 'quantization_config'
    if class_name == 'Dense':
        cfg.pop('quantization_config', None)

    # Remove 'lora_rank' if present (Keras 3.13+ feature)
    cfg.pop('lora_rank', None)

    # Handle DTypePolicy objects — convert to simple string
    if isinstance(cfg.get('dtype'), dict):
        dtype_cfg = cfg['dtype']
        if dtype_cfg.get('class_name') == 'DTypePolicy':
            cfg['dtype'] = dtype_cfg.get('config', {}).get('name', 'float32')

    # Recursively patch nested layers (e.g., Functional models inside Sequential)
    if 'layers' in cfg:
        for sub_layer in cfg['layers']:
            patch_layer_config(sub_layer)

    # Also patch build_config if present
    layer.pop('build_config', None)

    return layer


def fix_model(input_path, output_path):
    # Copy file first
    shutil.copy2(input_path, output_path)

    with h5py.File(output_path, 'r+') as f:
        config_str = f.attrs['model_config']
        config = json.loads(config_str)

        print(f"Original Keras version: {f.attrs.get('keras_version', 'unknown')}")
        print(f"Model class: {config['class_name']}")

        # Patch top-level DTypePolicy
        if isinstance(config.get('config', {}).get('dtype'), dict):
            dtype_cfg = config['config']['dtype']
            if dtype_cfg.get('class_name') == 'DTypePolicy':
                config['config']['dtype'] = dtype_cfg.get('config', {}).get('name', 'float32')

        # Patch all layers
        layers = config.get('config', {}).get('layers', [])
        for layer in layers:
            patch_layer_config(layer)

        # Remove build_config from top level
        config.get('config', {}).pop('build_config', None)

        # Write patched config back
        f.attrs['model_config'] = json.dumps(config)
        # Update keras version to match what we have
        f.attrs['keras_version'] = '3.10.0'

    print(f"✅ Patched model saved to: {output_path}")


if __name__ == '__main__':
    fix_model('model_v2.h5', 'model_v2_fixed.h5')
    
    # Verify it loads
    print("\nVerifying fixed model loads...")
    import keras
    print(f"Keras version: {keras.__version__}")
    model = keras.models.load_model('model_v2_fixed.h5', compile=False)
    print(f"✅ Model loaded successfully!")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    print(f"   Layers: {len(model.layers)}")
