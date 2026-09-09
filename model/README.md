# Landslide4Sense U-Net Model Checkpoint

This directory contains validation tools and inference code for the Landslide4Sense U-Net model.

## Model Specifications
- **Architecture:** U-Net
- **Encoder:** ResNet-34
- **Input Channels:** 14 (Landslide4Sense multispectral Sentinel-2 bands B1-B12 + DEM elevation + Slope)
- **Input Resolution:** 128 x 128 pixels (`[Batch, 14, 128, 128]`)
- **Output Classes:** 1 (Binary landslide probability logits map `[Batch, 1, 128, 128]`)
- **Best Epoch:** 14
- **Validation Metrics:**
  - IoU: 0.5900
  - Dice: 0.7422
  - Precision: 0.7117
  - Recall: 0.7754

## Weight File (`landslide_unet_best.pth`)
The PyTorch checkpoint file (`landslide_unet_best.pth`, ~280 MB) exceeds GitHub's 100 MB single-file repository limit and is excluded via `.gitignore`.

### Obtaining the Model Weights
Place `landslide_unet_best.pth` directly in this directory:
```bash
# Destination path:
model/landslide_unet_best.pth
```

### Running Validation and Architecture Test
To verify the checkpoint and test simulated forward inference:
```bash
python3 model/test_model.py
```
