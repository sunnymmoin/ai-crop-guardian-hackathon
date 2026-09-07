import os
import shutil
from sklearn.model_selection import train_test_split

# Detect whether color subfolder exists or classes are directly in plantvillage dataset
base_raw = os.path.join('raw_dataset', 'plantvillage dataset')
if os.path.exists(os.path.join(base_raw, 'color')):
    source_dir = os.path.join(base_raw, 'color')
else:
    source_dir = base_raw

base_dir = 'crop_dataset'
splits = ['train', 'val']

# Create destination train and val directories
for split in splits:
    os.makedirs(os.path.join(base_dir, split), exist_ok=True)

print(f"Reading dataset from: {source_dir}")

for class_name in os.listdir(source_dir):
    class_path = os.path.join(source_dir, class_name)
    if not os.path.isdir(class_path):
        continue

    for split in splits:
        os.makedirs(os.path.join(base_dir, split, class_name), exist_ok=True)

    images = [f for f in os.listdir(class_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not images:
        continue

    train_imgs, val_imgs = train_test_split(images, test_size=0.2, random_state=42)

    for img in train_imgs:
        shutil.copy(os.path.join(class_path, img), os.path.join(base_dir, 'train', class_name, img))
    for img in val_imgs:
        shutil.copy(os.path.join(class_path, img), os.path.join(base_dir, 'val', class_name, img))

print("Dataset structured successfully into 'crop_dataset/train' and 'crop_dataset/val'.")