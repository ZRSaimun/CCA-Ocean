from pathlib import Path
import torch
from torch.utils.data import Dataset
from PIL import Image
from torchvision.transforms.functional import pil_to_tensor

class CoralSegmentationDataset(Dataset):
    """Pairs images and integer-ID masks by matching filename stem."""
    def __init__(self,image_dir,mask_dir):
        self.images=sorted([p for p in Path(image_dir).iterdir() if p.suffix.lower() in {'.jpg','.jpeg','.png','.webp'}]);self.mask_dir=Path(mask_dir)
    def __len__(self):return len(self.images)
    def __getitem__(self,i):
        ip=self.images[i]; candidates=[self.mask_dir/(ip.stem+s) for s in ('.png','.tif','.tiff')];mp=next((p for p in candidates if p.exists()),None)
        if mp is None:raise FileNotFoundError(f'No mask for {ip.name}')
        x=pil_to_tensor(Image.open(ip).convert('RGB')).float()/255.;y=pil_to_tensor(Image.open(mp))[0].long();return x,y

def boundary_from_mask(mask):
    b=torch.zeros_like(mask,dtype=torch.float32);b[:,1:]|=(mask[:,1:]!=mask[:,:-1]);b[1:,:]|=(mask[1:,:]!=mask[:-1,:]);return b
