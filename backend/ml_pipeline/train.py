import torch
import torchvision.models as models
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 1. Define Data Transformations
normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
train_transforms = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    normalize
])

# 2. Load the Dataset
train_data = datasets.ImageFolder('crop_dataset/train', transform=train_transforms)
train_loader = DataLoader(train_data, batch_size=32, shuffle=True)

# 3. Initialize the Model (Transfer Learning with ResNet18 for speed)
weights = models.ResNet18_Weights.DEFAULT
model = models.resnet18(weights=weights)
num_ftrs = model.fc.in_features
# Map the output to the 38 PlantVillage classes
model.fc = nn.Linear(num_ftrs, 38) 

# 4. Define Loss and Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 5. Execute Training Loop (Set to 1 epoch to generate the binary quickly)
print("Starting training loop... This will take a few minutes.")
model.train()
for epoch in range(15): 
    for i, (inputs, labels) in enumerate(train_loader):
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        # Print progress every 100 batches so you know it isn't frozen
        if i % 100 == 0:
            print(f"Processing batch {i}...")
            
    print(f"Epoch {epoch+1} complete. Loss: {loss.item()}")

# 6. Save the Binary
torch.save(model.state_dict(), '../crop_model.pt')
print("Model successfully saved to backend/crop_model.pt!")