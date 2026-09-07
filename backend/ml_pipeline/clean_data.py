from PIL import Image
import os

def clean_dataset(directory):
    removed_count = 0
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                img = Image.open(file_path)
                img.verify() 
            except (IOError, SyntaxError):
                os.remove(file_path)
                removed_count += 1
    print(f"Cleaning complete. Removed {removed_count} corrupted files.")

clean_dataset('crop_dataset')